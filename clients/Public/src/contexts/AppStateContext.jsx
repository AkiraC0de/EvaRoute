/**
 * AppStateContext — the single store for the EvaRoute app.
 *
 * Replaces the old double bookkeeping (a union "state machine" plus ~15
 * parallel useState fields in App.tsx) with ONE reducer. The reducer enforces
 * the screen progression through the TRANSITIONS table instead of a blind
 * `{...prev, ...payload} as EvaRouteState` merge.
 *
 * Screens: initializing → location_ready → discovery → center_selected
 *          → route_preview → navigating → arrived
 *
 * Side effects (geolocation, facilities fetch, route fetch, navigation
 * tracking) are wired here once, through domain hooks, so feature components
 * only dispatch actions and render state.
 */
import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { DEFAULT_CENTER } from '../lib/constants';
import { useFacilitiesFeed } from '../features/discovery/useFacilitiesFeed';
import { useRouteFeed } from '../features/navigation/useRouteFeed';
import { useNavigationTracking } from '../features/navigation/useNavigationTracking';

/** Allowed screen transitions. Anything else is refused (with a warning). */
export const TRANSITIONS = {
  initializing: ['location_ready'],
  location_ready: ['discovery'],
  discovery: ['center_selected'],
  center_selected: ['route_preview', 'discovery', 'center_selected'],
  route_preview: ['navigating', 'center_selected', 'discovery'],
  navigating: ['arrived', 'center_selected', 'discovery'],
  arrived: ['discovery', 'center_selected'],
};

export function createInitialState() {
  return {
    // screen machine
    status: 'initializing',
    sheetExpanded: true,
    facility: null, // currently selected facility

    // facilities feed
    facilities: [],
    facilitiesLoading: true,
    facilitiesError: null,
    searchRadiusKm: null, // null = backend default (10 km)

    // discovery view state
    searchQuery: '',
    statusFilter: 'ALL',

    // route
    routeData: null,
    routeLoading: false,

    // live navigation tracking
    navUserPosition: null,
    navStepIndex: 0,
    navRemainingKm: null,

    // map
    mapCenter: DEFAULT_CENTER,

    // flow flags
    hasTransitionedToMap: false,
    locationSkipped: false,
    routeAwaitingLocation: false,
    // Mobile sheet starts CLOSED (map-first on first visit); the handle
    // expands it, and selecting a center opens its details.
    mobilePanelExpanded: false,
  };
}

/**
 * Actions:
 *   { type: 'goto', to, patch? } — validated screen transition + field updates
 *   { type: 'set', patch }      — field updates without a screen change
 *   { type: 'toggle_mobile_panel' }
 */
export function appReducer(state, action) {
  switch (action.type) {
    case 'goto': {
      const allowed = TRANSITIONS[state.status] ?? [];
      if (action.to !== state.status && !allowed.includes(action.to)) {
        // Refused transitions keep the current screen — never fabricate an
        // unreachable state (the old machine's blind merge could).
        console.warn(`[AppState] refused transition ${state.status} -> ${action.to}`);
        return { ...state, ...action.patch };
      }
      return { ...state, ...action.patch, status: action.to };
    }
    case 'toggle_mobile_panel':
      return { ...state, mobilePanelExpanded: !state.mobilePanelExpanded };
    case 'set':
      return { ...state, ...action.patch };
    default:
      return state;
  }
}

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState);
  const {
    position,
    loading: geoLoading,
    denied: geoDenied,
    error: geoError,
    permissionBlocked: geoPermissionBlocked,
    requestLocation,
  } = useGeolocation();

  // A genuine GPS fix — DEFAULT_CENTER is only ever a map centre.
  const hasRealLocation = position != null && !geoDenied && geoError == null;

  // Domain side effects (state + dispatch passed in — no import cycles).
  useFacilitiesFeed(state, dispatch, position, geoDenied, geoLoading);
  useRouteFeed(state, dispatch, position, geoDenied);
  useNavigationTracking(state, dispatch);

  // ── Screen effects (formerly inline in App.tsx) ──

  // Auto-request location on launch.
  useEffect(() => {
    if (state.status === 'initializing') requestLocation();
  }, [state.status, requestLocation]);

  // initializing → location_ready: a real fix or the explicit "continue
  // without location" choice. A failure stays on the splash (the user answers).
  useEffect(() => {
    if (state.status !== 'initializing') return;
    if (geoLoading && !state.locationSkipped) return;
    if (position != null || state.locationSkipped) {
      dispatch({ type: 'goto', to: 'location_ready' });
    }
  }, [state.status, position, geoLoading, state.locationSkipped]);

  // Map center follows user position (non-navigating).
  useEffect(() => {
    if (position && !geoLoading && !geoDenied && state.status !== 'navigating') {
      dispatch({
        type: 'set',
        patch: { mapCenter: [position.coords.latitude, position.coords.longitude] },
      });
    }
    // Intentionally mirrors the old dependency list: recenters on position
    // changes only, never on screen changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, geoLoading, geoDenied]);

  // ── Actions ──

  const enterDiscovery = useCallback(() => {
    dispatch({
      type: 'goto',
      to: 'discovery',
      patch: {
        searchQuery: '',
        statusFilter: 'ALL',
        hasTransitionedToMap: true,
        sheetExpanded: true,
        mapCenter:
          hasRealLocation && position
            ? [position.coords.latitude, position.coords.longitude]
            : DEFAULT_CENTER,
      },
    });
  }, [hasRealLocation, position]);

  // location_ready → discovery (once).
  useEffect(() => {
    if (state.status === 'location_ready' && !state.hasTransitionedToMap) {
      enterDiscovery();
    }
  }, [state.status, state.hasTransitionedToMap, enterDiscovery]);

  const selectCenter = useCallback((facility) => {
    // mobilePanelExpanded: clicking a marker on the map should open the
    // details, not a collapsed strip — the sheet was closed only for the
    // first-visit map-first state.
    dispatch({
      type: 'goto',
      to: 'center_selected',
      patch: { facility, sheetExpanded: true, mobilePanelExpanded: true },
    });
  }, []);

  const getRoute = useCallback(() => {
    if (hasRealLocation) {
      dispatch({
        type: 'goto',
        to: 'route_preview',
        patch: { routeAwaitingLocation: false, sheetExpanded: true },
      });
      return;
    }
    // No fix yet: ask the browser and continue automatically when it lands.
    dispatch({ type: 'set', patch: { routeAwaitingLocation: true } });
    requestLocation();
  }, [hasRealLocation, requestLocation]);

  // Finish the journey the user started once a genuine fix lands.
  useEffect(() => {
    if (!state.routeAwaitingLocation) return;
    if (!hasRealLocation || !position) return;
    dispatch({
      type: 'goto',
      to: 'route_preview',
      patch: { routeAwaitingLocation: false, sheetExpanded: true },
    });
  }, [state.routeAwaitingLocation, hasRealLocation, position]);

  const enableLocation = useCallback(() => requestLocation(), [requestLocation]);

  const startNavigation = useCallback(() => {
    dispatch({ type: 'goto', to: 'navigating', patch: { navStepIndex: 0, sheetExpanded: true } });
  }, []);

  const cancelNavigation = useCallback(() => {
    const patch = {
      routeData: null,
      routeLoading: false,
      navUserPosition: null,
      navRemainingKm: null,
      navStepIndex: 0,
      sheetExpanded: true,
    };
    if (state.facility) {
      dispatch({ type: 'goto', to: 'center_selected', patch });
    } else {
      dispatch({ type: 'goto', to: 'discovery', patch });
    }
  }, [state.facility]);

  const backToDiscovery = useCallback(() => {
    dispatch({
      type: 'goto',
      to: 'discovery',
      patch: {
        facility: null,
        routeData: null,
        routeLoading: false,
        navUserPosition: null,
        navRemainingKm: null,
        navStepIndex: 0,
        searchQuery: '',
        statusFilter: 'ALL',
        sheetExpanded: true,
        mapCenter:
          position && !geoDenied
            ? [position.coords.latitude, position.coords.longitude]
            : DEFAULT_CENTER,
      },
    });
  }, [position, geoDenied]);

  const cancelRoutePreview = useCallback(() => {
    const patch = { routeData: null, routeLoading: false, sheetExpanded: true };
    if (state.facility) {
      dispatch({ type: 'goto', to: 'center_selected', patch });
    } else {
      dispatch({ type: 'goto', to: 'discovery', patch });
    }
  }, [state.facility]);

  const expand = useCallback(() => {
    dispatch({ type: 'set', patch: { sheetExpanded: true, mobilePanelExpanded: true } });
  }, []);

  const toggleMobilePanel = useCallback(() => {
    dispatch({ type: 'toggle_mobile_panel' });
  }, []);

  const setSearch = useCallback((searchQuery) => {
    dispatch({ type: 'set', patch: { searchQuery } });
  }, []);

  const setStatusFilter = useCallback((statusFilter) => {
    dispatch({ type: 'set', patch: { statusFilter } });
  }, []);

  const expandSearchRadius = useCallback(() => {
    dispatch({ type: 'set', patch: { searchRadiusKm: 200 } });
  }, []);

  const continueWithoutLocation = useCallback(() => {
    dispatch({ type: 'set', patch: { locationSkipped: true } });
  }, []);

  const value = {
    state,
    // geolocation surface
    position,
    geoLoading,
    geoDenied,
    geoError,
    geoPermissionBlocked,
    hasRealLocation,
    requestLocation,
    // actions
    actions: {
      enterDiscovery,
      selectCenter,
      getRoute,
      enableLocation,
      startNavigation,
      cancelNavigation,
      backToDiscovery,
      cancelRoutePreview,
      expand,
      toggleMobilePanel,
      setSearch,
      setStatusFilter,
      expandSearchRadius,
      continueWithoutLocation,
    },
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}
