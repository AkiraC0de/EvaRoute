import { useRef, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { MutableRefObject } from 'react';
import { useGeolocation, DEFAULT_CENTER } from '../hooks/useGeolocation';
import type { Facility } from '../types/facility';
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

  // ── Facility markers: circular divIcon, claymorphic via CSS ──
  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    const visibleFacilities = isNavigating && selectedCenter ? [selectedCenter] : facilities;

    for (const facility of visibleFacilities) {
      const isSelected = facility.id === selectedCenter?.id;
      const isUnavailable = facility.status === 'UNAVAILABLE';

      const color = isUnavailable ? '#FFA000' : '#4CAF50';
      const size = isSelected ? 40 : 30;

      const html = `
        <div class="facility-marker ${isSelected ? 'selected' : ''}"
             style="background: ${color}; width: ${size}px; height: ${size}px;">
          <div class="facility-marker-dot" style="background: ${color};"></div>
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
          <strong style="color: #1A2332; font-size: 14px;">${facility.name}</strong>
          <div style="color: #64748B; margin-top: 2px; font-size: 12px;">
            ${facility.status === 'AVAILABLE' ? 'Safe' : 'Caution'}
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
      weight: 5,
      opacity: 0.92,
      className: 'route-line route-line-dashed',
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
