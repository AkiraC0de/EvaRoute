/**
 * App — thin shell.
 *
 * Holds only the map viewport refs and the screen switch; all state lives in
 * contexts/AppStateContext and all screen composition lives in features/.
 * (Formerly an 800-line component owning fetching, filtering, sorting,
 * navigation tracking and every overlay.)
 */
import { useRef, useMemo, useCallback } from 'react';
import { useAppState } from './contexts/AppStateContext';
import { DEFAULT_CENTER } from './lib/constants';
import { filterFacilities, sortClosest } from './features/discovery/facilityFilters';
import AppShell from './components/AppShell';
import EvaRouteMap from './features/map/EvaRouteMap';
import RecenterButton from './features/map/RecenterButton';
import SplashFlow from './features/splash/SplashFlow';
import DiscoveryOverlay from './features/discovery/DiscoveryOverlay';
import FacilityOverlay from './features/facility/FacilityOverlay';
import RoutePreviewOverlay from './features/navigation/RoutePreviewOverlay';
import NavigationOverlay from './features/navigation/NavigationOverlay';
import ArrivalOverlay from './features/navigation/ArrivalOverlay';

const MAP_STATUSES = ['discovery', 'center_selected', 'route_preview', 'navigating', 'arrived'];

export default function App() {
  const { state, position, hasRealLocation, actions } = useAppState();

  // Map viewport plumbing — Leaflet instance lives here, one place.
  // handleMapReady MUST be stable: EvaRouteMap's init effect depends on it and
  // re-creates the whole map on every identity change (wiping all layers).
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const handleMapReady = useCallback((map) => {
    leafletMapRef.current = map;
  }, []);

  // View derivations (formerly inline in the god component).
  const filteredFacilities = useMemo(
    () => filterFacilities(state.facilities, state.searchQuery, state.statusFilter),
    [state.facilities, state.searchQuery, state.statusFilter],
  );
  const sortedFacilities = useMemo(
    () => sortClosest(filteredFacilities, hasRealLocation),
    [filteredFacilities, hasRealLocation],
  );

  const showMap = MAP_STATUSES.includes(state.status);
  const isNavigating = state.status === 'navigating';
  const userPosition =
    isNavigating || state.status === 'arrived'
      ? (state.navUserPosition ?? position?.coords ?? null)
      : (position?.coords ?? null);

  return (
    <AppShell>
      {/* Map area */}
      <div className="map-area">
        {showMap && (
          <>
            <div ref={mapContainerRef} className="w-full h-full" />
            <EvaRouteMap
              containerRef={mapContainerRef}
              routeData={state.routeData}
              selectedCenter={state.facility}
              facilities={state.status === 'discovery' ? filteredFacilities : state.facilities}
              userPosition={userPosition}
              onCenterSelect={actions.selectCenter}
              onMapReady={handleMapReady}
              isNavigating={isNavigating}
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

      {/* Overlay area — one component per screen */}
      <div className="overlay-area">
        {(state.status === 'initializing' || state.status === 'location_ready') && <SplashFlow />}
        {state.status === 'discovery' && (
          <DiscoveryOverlay
            facilities={state.facilities}
            sortedFacilities={sortedFacilities}
            totalFacilities={state.facilities.length}
            recenterSlot={
              <RecenterButton
                mapRef={leafletMapRef}
                position={position?.coords ?? null}
                defaultCenter={DEFAULT_CENTER}
              />
            }
          />
        )}
        {state.status === 'center_selected' && <FacilityOverlay />}
        {state.status === 'route_preview' && <RoutePreviewOverlay />}
        {state.status === 'navigating' && <NavigationOverlay />}
        {state.status === 'arrived' && <ArrivalOverlay />}
      </div>
    </AppShell>
  );
}
