import { useRef, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { MutableRefObject } from 'react';
import { useGeolocation, DEFAULT_CENTER } from '../hooks/useGeolocation';
import { FACILITY_STATUS_META, type Facility } from '../types/facility';
import { geojsonToLatLngs, type OSRMRoute } from '../services/osrm';

interface EvaRouteMapProps {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  routeData: OSRMRoute | null;
  selectedCenter: Facility | null;
  facilities: Facility[];
  userPosition: { latitude: number; longitude: number } | null;
  onCenterSelect: (center: Facility) => void;
  onMapReady?: (map: L.Map | null) => void;
  isNavigating: boolean;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return entities[character];
  });
}

export default function EvaRouteMap({
  containerRef,
  routeData,
  selectedCenter,
  facilities,
  userPosition,
  onCenterSelect,
  onMapReady,
  isNavigating,
}: EvaRouteMapProps) {
  const { loading: geoLoading, denied: geoDenied } = useGeolocation();
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const navWatchId = useRef<number>(0);
  const navWatchActive = useRef(false);

  // ── Initialize map ──
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 13,
      zoomControl: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    mapRef.current = map;
    onMapReady?.(map);
    return () => {
      onMapReady?.(null);
      map.remove();
      mapRef.current = null;
    };
  }, [containerRef, onMapReady]);

  // ── Facility markers: status-colored pins with a centered facility icon ──
  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    const visibleFacilities = isNavigating && selectedCenter ? [selectedCenter] : facilities;

    for (const facility of visibleFacilities) {
      const isSelected = facility.id === selectedCenter?.id;
      const statusMeta = FACILITY_STATUS_META[facility.status];
      const facilityName = escapeHtml(facility.name);
      const size = isSelected ? 40 : 32;

      const html = `
        <div class="facility-marker ${isSelected ? 'selected' : ''}"
             style="--facility-marker-color: ${statusMeta.color}; width: ${size}px; height: ${size}px;">
          <span class="facility-marker-label">${facilityName}</span>
          <div class="facility-marker-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6M9 10h.01M15 10h.01" />
            </svg>
          </div>
        </div>`;

      const icon = L.divIcon({
        className: '',
        html,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2 - 4],
      });

      const marker = L.marker(
        [facility.latitude, facility.longitude],
        { icon, interactive: true }
      ).addTo(mapRef.current!);

      marker.on('click', () => onCenterSelect(facility));
      marker.bindTooltip(`
        <div style="font-family: var(--font-sans), system-ui, sans-serif; min-width: 140px; font-size: 13px;">
            <strong style="color: #1A2332; font-size: 14px;">${facilityName}</strong>
          <div style="color: #64748B; margin-top: 2px; font-size: 12px;">
            ${statusMeta.fullLabel}
          </div>
        </div>
      `, {
        direction: 'top',
        offset: [0, -size / 2 - 8],
        className: 'facility-tooltip',
      });

      markersRef.current.set(facility.id, marker);
    }
  }, [facilities, selectedCenter, onCenterSelect, isNavigating]);

  // ── User location: divIcon dot + animated halo ──
  useEffect(() => {
    if (!mapRef.current) return;
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (!userPosition || geoLoading || geoDenied) return;

    const { latitude, longitude } = userPosition;
    const icon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative; width:0; height:0;">
          <div class="user-location-halo"></div>
          <div class="user-location-dot"></div>
        </div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    userMarkerRef.current = L.marker(
      [latitude, longitude],
      { icon, interactive: false, zIndexOffset: 1000 }
    ).addTo(mapRef.current!);
    // Re-render on position change (nav tracking updates userPosition)
  }, [userPosition, geoLoading, geoDenied]);

  // ── Route line: dashed polyline, animated flyToBounds ──
  useEffect(() => {
    if (!mapRef.current) return;
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }
    if (!routeData || routeData.distance === 0) return;

    const latLngs = geojsonToLatLngs(routeData.geometry);
    if (latLngs.length === 0) return;

    const line = L.polyline(latLngs, {
      color: '#4A72FF',
      weight: 6,
      opacity: 0.95,
      className: 'route-line',
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(mapRef.current!);

    routeLineRef.current = line;
    mapRef.current.flyToBounds(line.getBounds(), {
      padding: [60, 60],
      maxZoom: 15,
      duration: 1.2,
      easeLinearity: 0.25,
    });
    // Route line depends on routeData; stable after calculation
  }, [routeData]);

  // ── Navigation: follow user location with smooth pan ──
  useEffect(() => {
    if (!isNavigating || !mapRef.current || !userPosition || geoDenied) {
      if (navWatchActive.current) {
        navigator.geolocation.clearWatch(navWatchId.current);
        navWatchActive.current = false;
      }
      return;
    }
    if (navWatchActive.current) return;

    navWatchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (!mapRef.current) return;
        const { latitude, longitude } = pos.coords;
        mapRef.current.panTo([latitude, longitude], { animate: true, duration: 0.5 });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
    );
    navWatchActive.current = true;

    return () => {
      navigator.geolocation.clearWatch(navWatchId.current);
      navWatchActive.current = false;
    };
  }, [isNavigating, userPosition, geoDenied]);

  return null;
}
