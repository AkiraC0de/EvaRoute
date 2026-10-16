/**
 * App — thin shell.
 *
 * Holds only the map viewport refs and the screen switch; all state lives in
 * contexts/AppStateContext and all screen composition lives in features/.
 */
import { useRef, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
      <div className="absolute inset-0 z-[1]">
        {showMap && (
          <>
            <div ref={mapContainerRef} className="h-full w-full" />
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

      {/* Overlay area — one screen at a time; AnimatePresence mode="wait"
          completes the exit before the next screen enters (motion-ui skill). */}
      <div className="pointer-events-none absolute inset-0 z-30 [&>*]:pointer-events-auto">
        <AnimatePresence mode="wait">
          {(state.status === 'initializing' || state.status === 'location_ready') && (
            <motion.div key="splash">
              <SplashFlow />
            </motion.div>
          )}
          {state.status === 'discovery' && (
            <motion.div key="discovery">
              <DiscoveryOverlay
                facilities={state.facilities}
                sortedFacilities={sortedFacilities}
                totalFacilities={state.facilities.length}
                recenterSlot={
                  <RecenterButton
                    inline
                    mapRef={leafletMapRef}
                    position={position?.coords ?? null}
                    defaultCenter={DEFAULT_CENTER}
                  />
                }
              />
            </motion.div>
          )}
          {state.status === 'center_selected' && (
            <motion.div key="center_selected">
              <FacilityOverlay />
            </motion.div>
          )}
          {state.status === 'route_preview' && (
            <motion.div key="route_preview">
              <RoutePreviewOverlay />
            </motion.div>
          )}
          {state.status === 'navigating' && (
            <motion.div key="navigating">
              <NavigationOverlay />
            </motion.div>
          )}
          {state.status === 'arrived' && (
            <motion.div key="arrived">
              <ArrivalOverlay />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
