import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { useAppState } from './state/useAppState';
import { type EvaRouteTransitionPayload } from './state/app-state';
import { useGeolocation, DEFAULT_CENTER } from './hooks/useGeolocation';
import { getRouteToFacility, type RouteData } from './services/routing';
import { fetchPublicFacilities } from './lib/api';
import AppShell from './components/AppShell';
import ArrivalOverlayCard from './components/ArrivalOverlayCard';
import EvaRouteMap from './components/EvaRouteMap';
import FacilityDiscoveryPanel, { type FacilityStatusFilter } from './components/FacilityDiscoveryPanel';
import FacilityDetailSidebar from './components/FacilityDetailSidebar';
import SplashScreen from './components/SplashScreen';
import CenterStatusBadge from './components/primitives/CenterStatusBadge';
import FacilitySearchFilterOverlay from './components/FacilitySearchFilterOverlay';
import OverlayContainer from './components/OverlayContainer';
import RoutePreviewCard from './components/RoutePreviewCard';
import TurnInstruction from './components/TurnInstruction';
import RecenterButton from './components/RecenterButton';
import DragHandle from './components/primitives/DragHandle';
import type { Facility } from './types/facility';

const ARRIVAL_THRESHOLD_M = 50;

// ── Haversine distance (km) ──
// Used for client-side distance/ETA where no routing data is available
// (e.g. live distance to a selected center) and for navigation proximity.
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function App() {
  const { state, transition } = useAppState();
  const {
    position,
    loading: geoLoading,
    denied: geoDenied,
    error: geoError,
    permissionBlocked: geoPermissionBlocked,
    requestLocation,
  } = useGeolocation();

  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);

  // Data state
  // Facilities come from GET /api/v1/public/facility (the real integration).
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [facilitiesError, setFacilitiesError] = useState<string | null>(null);
  /** Search radius in km. null = backend default (10 km). Set when the user
   *  chooses to expand the search beyond the default radius. */
  const [searchRadiusKm, setSearchRadiusKm] = useState<number | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [hasTransitionedToMap, setHasTransitionedToMap] = useState(false);
  /**
   * Set only by the splash's explicit "Continue Without Location" action.
   * It lets the user enter discovery with no GPS fix. This is what marks the
   * session as fallback mode — DEFAULT_CENTER is then just a map centre and is
   * never treated as the user's position.
   */
  const [locationSkipped, setLocationSkipped] = useState(false);
  /**
   * Set when Get Route is pressed without a real location. We then ask the
   * browser for location and, on success, continue into route_preview
   * automatically — the user never presses Get Route twice.
   */
  const [routeAwaitingLocation, setRouteAwaitingLocation] = useState(false);

  // Navigation tracking
  const [navUserPosition, setNavUserPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [navRemainingDistance, setNavRemainingDistance] = useState<number | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FacilityStatusFilter>('ALL');
  const [mobilePanelExpanded, setMobilePanelExpanded] = useState(true);

  // Whether we hold a genuine GPS fix for the user.
  //
  // This is the single distinction between "real user location" and the
  // prototype's DEFAULT_CENTER fallback. DEFAULT_CENTER is only ever a map
  // centre / API query origin — never a stand-in for the user's position.
  const hasRealLocation = position != null && !geoDenied && geoError == null;

  // Distance per facility.
  // Real mode: `distance` already comes from the backend (`distanceKm`), so
  // the list carries the server-computed distance as-is.
  //
  // Without a real fix there is no honest "distance from user", so `distance`
  // is left undefined rather than measured from DEFAULT_CENTER. Consumers
  // already treat a missing distance as "unknown" (see CenterDistance usage),
  // and closest-first sorting skips sorting entirely in that state.
  const facilitiesWithDistance = facilities;
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredFacilities = facilitiesWithDistance.filter((facility) => {
    const matchesQuery = !normalizedSearchQuery ||
      facility.name.toLowerCase().includes(normalizedSearchQuery) ||
      facility.address.toLowerCase().includes(normalizedSearchQuery);
    const matchesStatus = statusFilter === 'ALL' || facility.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  // Closest-first ordering.
  // Applied to the already-filtered list so search/status filtering is
  // unaffected, and derived on every render so it follows the live position.
  // `distance` is the Haversine km computed above (mock) or supplied by the
  // backend (`distanceKm`, real mode). When the user has denied or not yet
  // granted location there is no meaningful origin, so the existing order is
  // preserved rather than sorting against a fallback centre.
  const sortedFacilities = useMemo(() => {
    // No real GPS fix → there is no "closest to user", so preserve the
    // existing order instead of ranking facilities around DEFAULT_CENTER.
    if (!hasRealLocation) return filteredFacilities;
    return [...filteredFacilities].sort((a, b) => {
      const aDistance = typeof a.distance === 'number' && Number.isFinite(a.distance)
        ? a.distance
        : Number.POSITIVE_INFINITY;
      const bDistance = typeof b.distance === 'number' && Number.isFinite(b.distance)
        ? b.distance
        : Number.POSITIVE_INFINITY;
      // Ties keep their existing relative order (Array#sort is stable), and
      // records with unusable coordinates sink to the end instead of jumping
      // to the front as if they were at the user's exact position.
      if (aDistance === bDistance) return 0;
      return aDistance - bDistance;
    });
  }, [filteredFacilities, position, geoDenied]);

  // Geolocation → location_ready.
  //
  // Only a REAL fix advances this automatically. A denial/error keeps the app
  // on the splash, which offers "Use My Location" and "Continue Without
  // Location" — a failure is a question for the user to answer, not something
  // to silently skip past.
  useEffect(() => {
    if (state.status !== 'initializing') return;
    if (geoLoading && !locationSkipped) return;
    // Real fix, or the user explicitly chose to continue without location.
    if (position != null || locationSkipped) {
      transition({ status: 'location_ready' });
    }
  }, [state.status, position, geoLoading, locationSkipped, transition]);

  // Auto-request location on app launch (Frame 01 → Frame 02).
  // `position == null` is intentional: a late-arriving fix still populates
  // `position`, and the effect above then continues the normal flow.
  useEffect(() => {
    if (state.status === 'initializing') {
      requestLocation();
    }
  }, [state.status, requestLocation]);

  // Map center follows user position (non-navigating)
  useEffect(() => {
    if (position && !geoLoading && !geoDenied && !isNavigatingState()) {
      setMapCenter([position.coords.latitude, position.coords.longitude]);
    }
  }, [position, geoLoading, geoDenied]);

  // Load facilities from the backend.
  //
  // GET /api/v1/public/facility requires fromLong/fromLat, so the request is
  // deferred until geolocation has settled (granted OR denied). On denial we
  // fall back to DEFAULT_CENTER — the same fallback the map already uses — so
  // discovery still works without a GPS fix.
  //
  // Re-runs when the resolved center changes, so a late-arriving GPS fix
  // replaces the fallback-center results.
  const queryLongitude = position && !geoDenied ? position.coords.longitude : DEFAULT_CENTER[1];
  const queryLatitude = position && !geoDenied ? position.coords.latitude : DEFAULT_CENTER[0];

  useEffect(() => {
    // Wait for geolocation to settle before querying.
    if (geoLoading) return;

    let cancelled = false;
    setFacilitiesLoading(true);

    fetchPublicFacilities({
      longitude: queryLongitude,
      latitude: queryLatitude,
      distanceKm: searchRadiusKm ?? undefined,
    })
      .then((data) => {
        if (cancelled) return;
        // Always replace the placeholder, including with an empty list, so
        // the real (possibly empty) backend state is what the UI reflects.
        setFacilities(data);
        setFacilitiesError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // Do NOT fall back to mock data on failure — surface the error
        // instead of showing stale placeholder facilities as if they were real.
        setFacilities([]);
        setFacilitiesError(err instanceof Error ? err.message : 'Failed to load evacuation centers.');
      })
      .finally(() => {
        if (cancelled) return;
        setFacilitiesLoading(false);
      });

    return () => { cancelled = true; };
  }, [queryLongitude, queryLatitude, geoLoading, searchRadiusKm]);

  function isNavigatingState(): boolean {
    return state.status === 'navigating';
  }

  // Enter discovery.
  // With a real fix the map centres on the user; otherwise it falls back to
  // DEFAULT_CENTER purely as a map centre (it is never treated as a fix).
  const enterDiscovery = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('ALL');
    transition({ status: 'discovery', sheetExpanded: true, searchQuery: '' });
    setHasTransitionedToMap(true);
    setMapCenter(hasRealLocation && position
      ? [position.coords.latitude, position.coords.longitude]
      : DEFAULT_CENTER);
  }, [transition, position, hasRealLocation]);

  // Auto-transition to discovery after location is acquired (Frame 02 → Frame 03)
  useEffect(() => {
    if (state.status === 'location_ready' && !hasTransitionedToMap) {
      enterDiscovery();
    }
  }, [state.status, hasTransitionedToMap, enterDiscovery]);

  // ── Get Route without a real location ────────────────────────────────────
  // Reuses the existing requestLocation(); no second geolocation path, no
  // reload, no navigation. On success we continue into route_preview
  // automatically so the user never presses the button twice.
  const handleGetRoute = useCallback(() => {
    if (hasRealLocation) {
      // Real position available — unchanged behaviour.
      setRouteAwaitingLocation(false);
      transition({ status: 'route_preview', centerId: selectedFacility?.id, sheetExpanded: true });
      return;
    }
    // No real fix: ask the browser, stay exactly where we are.
    setRouteAwaitingLocation(true);
    requestLocation();
  }, [hasRealLocation, selectedFacility, transition, requestLocation]);

  // Retry path for the inline "Enable Location" action.
  const handleEnableLocation = useCallback(() => {
    requestLocation();
  }, [requestLocation]);

  // Once a genuine fix lands, finish the journey the user started. The route
  // effect below then computes from the real position.
  useEffect(() => {
    if (!routeAwaitingLocation) return;
    if (!hasRealLocation || !position) return;
    setRouteAwaitingLocation(false);
    transition({ status: 'route_preview', centerId: selectedFacility?.id, sheetExpanded: true });
  }, [routeAwaitingLocation, hasRealLocation, position, selectedFacility, transition]);

  // Route calculation
  useEffect(() => {
    if (state.status === 'route_preview' && position && selectedFacility && !geoDenied) {
      setRouteLoading(true);
      getRouteToFacility(
        selectedFacility.id,
        position.coords.longitude,
        position.coords.latitude,
      ).then((r) => {
        setRouteData(r);
        setRouteLoading(false);
      });
    } else if (state.status === 'discovery' || state.status === 'center_selected' ||
      state.status === 'location_ready' || state.status === 'initializing') {
      setRouteData(null);
      setRouteLoading(false);
    }
  }, [state.status, position, selectedFacility, geoDenied]);

  // Navigation tracking (watchPosition)
  useEffect(() => {
    if (state.status !== 'navigating' || !selectedFacility || geoDenied) {
      if (state.status !== 'arrived') {
        setNavUserPosition(null);
        setNavRemainingDistance(null);
        setCurrentStepIndex(0);
      }
      return;
    }
    if (!navigator.geolocation) return;

    const steps = routeData?.legs?.flatMap(l => l.steps) ?? [];
    const targetLat = selectedFacility.latitude;
    const targetLon = selectedFacility.longitude;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setNavUserPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        const remaining = haversineKm(pos.coords.latitude, pos.coords.longitude, targetLat, targetLon);
        setNavRemainingDistance(remaining);

        if (steps.length > 0) {
          let closestIdx = 0;
          let closestDist = Infinity;
          for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            if (!step.location || step.location.length < 2) continue;
            const d = haversineKm(pos.coords.latitude, pos.coords.longitude, step.location[1], step.location[0]);
            if (d < closestDist) { closestDist = d; closestIdx = i; }
          }
          if (closestDist < 200) setCurrentStepIndex(closestIdx);
        }

        if (remaining * 1000 < ARRIVAL_THRESHOLD_M) {
          transition({ status: 'arrived' });
        }
      },
      (err) => console.warn('Navigation tracking error:', err.message),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [state.status, selectedFacility, routeData, transition]);

  // ── Handlers ──
  const handleCenterSelect = useCallback((center: Facility) => {
    setSelectedFacility(center);
    transition({
      status: 'center_selected',
      centerId: center.id,
      sheetExpanded: true,
      facility: center,
    });
  }, [transition]);

  const handleMapReady = useCallback((map: LeafletMap | null) => {
    leafletMapRef.current = map;
  }, []);

  const handleStartNavigation = useCallback(() => {
    setCurrentStepIndex(0);
    transition({ status: 'navigating', centerId: selectedFacility?.id ?? '', sheetExpanded: true });
  }, [transition, selectedFacility]);

  const handleCancelNavigation = useCallback(() => {
    setRouteData(null);
    setRouteLoading(false);
    setNavUserPosition(null);
    setNavRemainingDistance(null);
    setCurrentStepIndex(0);
    if (selectedFacility) {
      transition({
        status: 'center_selected',
        centerId: selectedFacility.id,
        sheetExpanded: true,
        facility: selectedFacility,
      });
      return;
    }
    transition({ status: 'discovery', sheetExpanded: true, searchQuery: '' });
  }, [transition, selectedFacility]);

  const handleBackToDiscovery = useCallback(() => {
    setSelectedFacility(null);
    setRouteData(null);
    setRouteLoading(false);
    setNavUserPosition(null);
    setNavRemainingDistance(null);
    setCurrentStepIndex(0);
    setSearchQuery('');
    setStatusFilter('ALL');
    setMapCenter(position && !geoDenied
      ? [position.coords.latitude, position.coords.longitude]
      : DEFAULT_CENTER);
    transition({ status: 'discovery', sheetExpanded: true, searchQuery: '' });
  }, [transition, position, geoDenied]);

  const handleCancelRoutePreview = useCallback(() => {
    setRouteData(null);
    setRouteLoading(false);
    if (selectedFacility) {
      transition({
        status: 'center_selected',
        centerId: selectedFacility.id,
        sheetExpanded: true,
        facility: selectedFacility,
      });
      return;
    }
    transition({ status: 'discovery', sheetExpanded: true, searchQuery: '' });
  }, [transition, selectedFacility]);

  const handleExpand = useCallback(() => {
    setMobilePanelExpanded(true);
    const s = state as EvaRouteTransitionPayload;
    transition({
      status: state.status,
      sheetExpanded: true,
      centerId: s.centerId ?? undefined,
      facility: s.facility ?? undefined,
      searchQuery: s.searchQuery ?? '',
    });
  }, [transition, state]);

  const handleMobilePanelToggle = useCallback(() => {
    setMobilePanelExpanded((expanded) => !expanded);
  }, []);

  // ── Splash renders ──
  // A failed automatic request keeps the user on the splash, where they can
  // retry or explicitly continue without location.
  const locationFailed =
    !locationSkipped &&
    position == null &&
    !geoLoading &&
    (geoDenied || geoError != null);

  const renderSplash = (locationReady: boolean) => (
    <SplashScreen
      locationReady={locationReady}
      ready={state.status === 'location_ready'}
      locationFailed={locationFailed}
      locationErrorMessage={geoError}
      permissionBlocked={geoPermissionBlocked}
      retrying={geoLoading}
      onRetryLocation={() => {
        requestLocation();
      }}
      onContinueWithoutLocation={() => {
        setLocationSkipped(true);
      }}
    />
  );

  // ── Discovery (expanded) ──
  const renderDiscoveryExpanded = () => {
    return (
      <>
        {/* List: floating card on mobile, panel on desktop */}
        <OverlayContainer
          variant="panel"
          expanded={true}
          mobileExpanded={mobilePanelExpanded}
          onMobileToggle={handleMobilePanelToggle}
          collapsedContent={renderDiscoveryCollapsed()}
        >
          <FacilityDiscoveryPanel
            facilities={sortedFacilities}
            totalFacilities={facilities.length}
            onSelect={handleCenterSelect}
            loading={facilitiesLoading}
            error={facilitiesError}
          />
          {!facilitiesLoading && !facilitiesError && sortedFacilities.length === 0 && searchRadiusKm === null && (
            <div className="facility-expand-search">
              <p className="facility-expand-search-text">
                No centers found within the default 10 km radius.
              </p>
              <button
                type="button"
                className="facility-expand-search-button"
                onClick={() => setSearchRadiusKm(200)}
              >
                Search up to 200 km
              </button>
            </div>
          )}
        </OverlayContainer>
      </>
    );
  };

  // ── Discovery (collapsed — Frame 04) ──
  const renderDiscoveryCollapsed = () => (
    <button
      type="button"
      className="discovery-collapsed-toggle flex flex-col items-center w-full py-3"
      onClick={handleExpand}
      aria-label="Expand list"
    >
      {/* Pill button with a chevron inside, matching the sheet-handle language
          used by facility detail, route preview and navigation. */}
      <span className="discovery-collapsed-handle" aria-hidden="true">
        <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6" />
        </svg>
      </span>
      <h2 className="text-[var(--font-size-base)] font-semibold text-[var(--color-text-primary)] truncate mt-2">
        Nearby Evacuation Centers
      </h2>
    </button>
  );

  // ── Center selected (expanded — Frame 05) ──
  const renderCenterSelected = () => {
    if (state.status !== 'center_selected') return null;
    const s = state as Extract<typeof state, { status: 'center_selected' }>;
    const facility = s.facility;
    if (!facility) return null;

    let liveDistance: number | undefined;
    if (position && !geoLoading && !geoDenied) {
      liveDistance = haversineKm(position.coords.latitude, position.coords.longitude, facility.latitude, facility.longitude);
    }

    return (
      <OverlayContainer
        variant="panel"
        expanded={s.sheetExpanded}
        mobileExpanded={mobilePanelExpanded}
        onMobileToggle={handleMobilePanelToggle}
        className="facility-detail-overlay"
        collapsedContent={
          // One tap target holds the drag handle and the summary together, so the
          // handle stays attached to the sheet it collapses. The handle is a
          // sibling above the text rather than an overlay, so nothing overlaps.
          <button
            type="button"
            className="facility-detail-collapsed-summary"
            onClick={handleExpand}
            aria-label="Show details"
          >
            <span className="facility-detail-collapsed-handle" aria-hidden="true">
              <DragHandle />
            </span>
            <span className="facility-detail-collapsed-name">
              {facility.name}
            </span>
            <span className="facility-detail-collapsed-address">
              {facility.address}
            </span>
            <span className="facility-detail-collapsed-status">
              <CenterStatusBadge status={facility.status} fullLabel />
              <span className="facility-detail-collapsed-capacity">
                {facility.maxCapacity.toLocaleString()} spaces max
              </span>
            </span>
          </button>
        }
      >
        <FacilityDetailSidebar
          facility={facility}
          distance={liveDistance}
          currentOccupancy={undefined}
          resources={facility.resources}
          onBack={handleBackToDiscovery}
          onGetRoute={handleGetRoute}
          locationPrompt={
            routeAwaitingLocation && !hasRealLocation
              ? {
                  requesting: geoLoading,
                  // A blocked origin gets the site-settings wording; anything
                  // else (unavailable/timeout) stays retryable.
                  blocked: geoPermissionBlocked,
                }
              : null
          }
          onEnableLocation={handleEnableLocation}
        />
      </OverlayContainer>
    );
  };

  // ── Route preview (expanded — Frame 06) ──
  const renderRoutePreviewExpanded = () => {
    if (state.status !== 'route_preview') return null;
    const s = state as Extract<typeof state, { status: 'route_preview' }>;
    if (!selectedFacility) return null;

    return (
      <OverlayContainer
        variant="route-card"
        expanded={s.sheetExpanded}
        mobileExpanded={mobilePanelExpanded}
        onMobileToggle={handleMobilePanelToggle}
        collapsedContent={renderRoutePreviewCollapsed()}
      >
        <RoutePreviewCard
          facility={selectedFacility}
          routeData={routeData}
          routeLoading={routeLoading}
          currentOccupancy={undefined}
          onCancel={handleCancelRoutePreview}
          onStartNavigation={handleStartNavigation}
        />
      </OverlayContainer>
    );
  };

  // ── Route preview (collapsed — Frame 07) ──
  const renderRoutePreviewCollapsed = () => {
    if (!routeData || routeData.distance === 0) return (
      <div className="route-preview-collapsed">
        <button
          className="route-preview-collapsed-chevron"
          onClick={handleExpand}
          aria-label="Show route details"
        >
          <DragHandle />
        </button>
        <div className="route-preview-collapsed-row">
          <span className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)]">
            Route Preview
          </span>
        </div>
      </div>
    );
    return (
      <div className="route-preview-collapsed">
        {/* Reuses the shared DragHandle pill (same as the facility-detail sheet)
            so the control reads as a grip rather than an arrow. Click behaviour
            is unchanged. */}
        <button
          className="route-preview-collapsed-chevron"
          onClick={handleExpand}
          aria-label="Show route details"
        >
          <DragHandle />
        </button>

        <div className="route-preview-collapsed-row">
          <div className="route-preview-collapsed-info">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.12 }}>
              <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.00 9.00 0 100-18 9.00 9.00 0 000 18z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)] truncate">
                {(routeData.distance / 1000).toFixed(1)} km · {Math.round(routeData.duration / 60)} min
              </div>
              <div className="text-[var(--font-size-xs)] text-[var(--color-text-caption)] truncate">
                to {selectedFacility?.name}
              </div>
            </div>
          </div>
          <button
            className="route-preview-collapsed-cancel"
            onClick={handleCancelRoutePreview}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // ── Navigating (expanded — Frame 08) ──
  const renderNavigatingExpanded = () => {
    if (state.status !== 'navigating') return null;
    if (!selectedFacility) return null;
    const s = state as Extract<typeof state, { status: 'navigating' }>;

    const steps = routeData?.legs?.flatMap(l => l.steps) ?? [];
    const currentStep = steps[currentStepIndex];
    const instruction = currentStep?.text ?? 'Following route';
    const maneuverType = currentStep?.text ?? undefined;

    const remaining = navRemainingDistance;
    const remainingKm = remaining !== null ? remaining.toFixed(1) : null;

    return (
      <>
        <TurnInstruction
          instruction={instruction}
          distance={remainingKm != null ? parseFloat(remainingKm) : undefined}
        />
        <OverlayContainer
          variant="route-card"
          expanded={s.sheetExpanded}
          mobileExpanded={mobilePanelExpanded}
          onMobileToggle={handleMobilePanelToggle}
          className="navigation-overlay"
          collapsedContent={renderNavigatingCollapsed()}
        >
          <RoutePreviewCard
            facility={selectedFacility}
            routeData={routeData}
            routeLoading={false}
            isNavigating
            onCancel={handleCancelNavigation}
          />
        </OverlayContainer>
      </>
    );
  };

  // ── Navigating (collapsed — Frame 09) ──
  const renderNavigatingCollapsed = () => (
    <div className="route-preview-collapsed">
      {/* Shared DragHandle pill, matching the facility-detail and collapsed
          route-preview grips. Expand behaviour is unchanged. */}
      <button
        className="route-preview-collapsed-chevron"
        onClick={handleExpand}
        aria-label="Show navigation details"
      >
        <DragHandle />
      </button>

      <div className="route-preview-collapsed-row">
        <div className="route-preview-collapsed-info">
          <div className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse shrink-0" />
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.12 }}>
            <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)] truncate">
              {navRemainingDistance != null ? `${navRemainingDistance.toFixed(1)} km remaining` : 'Navigating'}
            </div>
            <div className="text-[var(--font-size-xs)] text-[var(--color-text-caption)] truncate">
              {selectedFacility?.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Arrived ──
  const renderArrived = () => <ArrivalOverlayCard facility={selectedFacility} onFinish={handleBackToDiscovery} />;

  // ── Map visibility ──
  const showMap = state.status === 'discovery' || state.status === 'center_selected' ||
    state.status === 'route_preview' || state.status === 'navigating' || state.status === 'arrived';

  return (
    <AppShell>
      {/* Map area */}
      <div className="map-area">
        {showMap && (
          <>
            <div ref={mapContainerRef} className="w-full h-full" />
            <EvaRouteMap
              containerRef={mapContainerRef}
              routeData={routeData}
              selectedCenter={selectedFacility}
              facilities={state.status === 'discovery' ? filteredFacilities : facilitiesWithDistance}
              userPosition={state.status === 'navigating' || state.status === 'arrived'
                ? (navUserPosition ?? position?.coords ?? null)
                : (position?.coords ?? null)}
              onCenterSelect={handleCenterSelect}
              onMapReady={handleMapReady}
              isNavigating={isNavigatingState()}
            />
            {state.status !== 'discovery' && (
              <RecenterButton
                mapRef={leafletMapRef}
                position={position?.coords ?? null}
                defaultCenter={DEFAULT_CENTER}
              />
            )}
          </>
        )}
      </div>

      {/* Overlay area */}
      <div className="overlay-area">
        {(state.status === 'initializing' || state.status === 'location_ready') && renderSplash(position != null)}
        {state.status === 'discovery' && (
          <>
            {/* Search/filter + recenter overlay — all screen sizes */}
            <FacilitySearchFilterOverlay
              query={searchQuery}
              facilities={facilitiesWithDistance}
              statusFilter={statusFilter}
              onQueryChange={setSearchQuery}
              onStatusFilterChange={setStatusFilter}
              recenterSlot={
                <RecenterButton
                  mapRef={leafletMapRef}
                  position={position?.coords ?? null}
                  defaultCenter={DEFAULT_CENTER}
                />
              }
            />
            {state.sheetExpanded ? renderDiscoveryExpanded() : renderDiscoveryCollapsed()}
          </>
        )}
        {state.status === 'center_selected' && renderCenterSelected()}
        {state.status === 'route_preview' && (state.sheetExpanded ? renderRoutePreviewExpanded() : renderRoutePreviewCollapsed())}
        {state.status === 'navigating' && (state.sheetExpanded ? renderNavigatingExpanded() : renderNavigatingCollapsed())}
        {state.status === 'arrived' && renderArrived()}
      </div>
    </AppShell>
  );
}
