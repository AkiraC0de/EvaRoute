import { useRef, useState, useEffect, useCallback } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { useAppState } from './state/useAppState';
import { type EvaRouteTransitionPayload } from './state/app-state';
import { useGeolocation, DEFAULT_CENTER } from './hooks/useGeolocation';
import { mockFacilities } from './data/mockFacilities';
import { getRoute, type OSRMRoute } from './services/osrm';
import AppShell from './components/AppShell';
import ArrivalOverlayCard from './components/ArrivalOverlayCard';
import EvaRouteMap from './components/EvaRouteMap';
import FacilityDiscoveryPanel, { type FacilityStatusFilter } from './components/FacilityDiscoveryPanel';
import FacilityDetailSidebar from './components/FacilityDetailSidebar';
import SplashScreen from './components/SplashScreen';
import FacilitySearchFilterOverlay from './components/FacilitySearchFilterOverlay';
import OverlayContainer from './components/OverlayContainer';
import RoutePreviewCard from './components/RoutePreviewCard';
import TurnInstruction from './components/TurnInstruction';
import RecenterButton from './components/RecenterButton';
import DragHandle from './components/primitives/DragHandle';
import type { Facility } from './types/facility';

const ARRIVAL_THRESHOLD_M = 50;

// ── Haversine distance (km) ──
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
  const { position, loading: geoLoading, denied: geoDenied, error: geoError, requestLocation } = useGeolocation();

  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);

  // Data state
  const [facilities] = useState<Facility[]>(mockFacilities);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [routeData, setRouteData] = useState<OSRMRoute | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [hasTransitionedToMap, setHasTransitionedToMap] = useState(false);

  // Navigation tracking
  const [navUserPosition, setNavUserPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [navRemainingDistance, setNavRemainingDistance] = useState<number | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FacilityStatusFilter>('ALL');

  const facilitiesWithDistance = facilities.map((facility) => {
    if (position && !geoLoading && !geoDenied) {
      return {
        ...facility,
        distance: haversineKm(position.coords.latitude, position.coords.longitude, facility.latitude, facility.longitude),
      };
    }
    return { ...facility, distance: undefined };
  });
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredFacilities = facilitiesWithDistance.filter((facility) => {
    const matchesQuery = !normalizedSearchQuery ||
      facility.name.toLowerCase().includes(normalizedSearchQuery) ||
      facility.address.toLowerCase().includes(normalizedSearchQuery);
    const matchesStatus = statusFilter === 'ALL' || facility.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  // Geolocation → location_ready
  useEffect(() => {
    if (state.status === 'initializing' && position && !geoLoading) {
      transition({ status: 'location_ready' });
    }
  }, [state.status, position, geoLoading, transition]);

  // Auto-request location on app launch (Frame 01 → Frame 02)
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

  function isNavigatingState(): boolean {
    return state.status === 'navigating';
  }

  // Enter discovery
  const enterDiscovery = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('ALL');
    transition({ status: 'discovery', sheetExpanded: true, searchQuery: '' });
    setHasTransitionedToMap(true);
    setMapCenter(position && !geoDenied
      ? [position.coords.latitude, position.coords.longitude]
      : DEFAULT_CENTER);
  }, [transition, position, geoDenied]);

  // Auto-transition to discovery after location is acquired (Frame 02 → Frame 03)
  useEffect(() => {
    if (state.status === 'location_ready' && !hasTransitionedToMap) {
      enterDiscovery();
    }
  }, [state.status, hasTransitionedToMap, enterDiscovery]);

  // Route calculation
  useEffect(() => {
    if (state.status === 'route_preview' && position && selectedFacility && !geoDenied) {
      setRouteLoading(true);
      const start: [number, number] = [position.coords.longitude, position.coords.latitude];
      const end: [number, number] = [selectedFacility.longitude, selectedFacility.latitude];
      getRoute(start, end).then((r) => {
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
    const s = state as EvaRouteTransitionPayload;
    transition({
      status: state.status,
      sheetExpanded: true,
      centerId: s.centerId ?? undefined,
      facility: s.facility ?? undefined,
      searchQuery: s.searchQuery ?? '',
    });
  }, [transition, state]);

  // ── Splash renders ──
  const renderSplash = (locationReady: boolean) => (
    <SplashScreen
      locationReady={locationReady}
      ready={state.status === 'location_ready'}
    />
  );

  // ── Discovery (expanded) ──
  const renderDiscoveryExpanded = () => {
    return (
      <>
        {/* List: floating card on mobile, panel on desktop */}
        <OverlayContainer variant="panel" expanded={true} collapsedContent={renderDiscoveryCollapsed()}>
          <FacilityDiscoveryPanel
            facilities={filteredFacilities}
            totalFacilities={facilities.length}
            onSelect={handleCenterSelect}
          />
        </OverlayContainer>
      </>
    );
  };

  // ── Discovery (collapsed — Frame 04) ──
  const renderDiscoveryCollapsed = () => (
    <button
      type="button"
      className="flex flex-col items-center w-full py-3"
      onClick={handleExpand}
      aria-label="Expand list"
    >
      <DragHandle />
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
        collapsedContent={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: facility.status === 'AVAILABLE' ? 'var(--color-success)' : facility.status === 'LIMITED' ? 'var(--color-warning)' : 'var(--color-full)' }} />
              <span className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)] truncate">
                {facility.name}
              </span>
            </div>
            <button
              type="button"
              className="flex items-center justify-center w-full py-2"
              onClick={handleExpand}
              aria-label="Show details"
            >
              <DragHandle />
            </button>
          </div>
        }
      >
        <FacilityDetailSidebar
          facility={facility}
          distance={liveDistance}
          currentOccupancy={undefined}
          onBack={handleBackToDiscovery}
          onGetRoute={() => transition({ status: 'route_preview', centerId: facility.id, sheetExpanded: true })}
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
      <div className="flex items-center justify-between w-full">
        <span className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)]">Route Preview</span>
        <div className="flex items-center gap-1">
          <button className="collapse-chevron text-[var(--color-text-caption)]" onClick={handleExpand} aria-label="Show route details">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
    return (
      <div className="flex items-center justify-between w-full gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.12 }}>
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
        <div className="flex items-center gap-1">
          <button
            className="text-[var(--font-size-xs)] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            onClick={handleCancelRoutePreview}
          >
            Cancel
          </button>
          <button className="collapse-chevron text-[var(--color-text-caption)]" onClick={handleExpand} aria-label="Show route details">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
            </svg>
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
    const instruction = currentStep?.maneuver ?? 'Following route';
    const maneuverType = currentStep?.maneuver ?? undefined;

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
    <div className="flex items-center justify-between w-full gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.12 }}>
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
      <button className="collapse-chevron text-[var(--color-text-caption)]" onClick={handleExpand} aria-label="Show navigation details">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
        </svg>
      </button>
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
