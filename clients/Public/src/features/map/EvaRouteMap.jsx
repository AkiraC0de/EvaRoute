import { useRef, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useGeolocation } from '../../hooks/useGeolocation';
import { DEFAULT_CENTER } from '../../lib/constants';
import { FACILITY_STATUS_META } from '../../lib/facilityMeta';
import { geojsonToLatLngs } from '../../services/routing';
function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, (character) => {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;',
        };
        return entities[character];
    });
}
export default function EvaRouteMap({ containerRef, routeData, selectedCenter, facilities, userPosition, onCenterSelect, onMapReady, isNavigating, }) {
    const { loading: geoLoading, denied: geoDenied } = useGeolocation();
    const mapRef = useRef(null);
    const markersRef = useRef(new Map());
    const userMarkerRef = useRef(null);
    const routeLineRef = useRef(null);
    const navWatchId = useRef(0);
    const navWatchActive = useRef(false);
    // ── Initialize map ──
    useEffect(() => {
        if (!containerRef.current || mapRef.current)
            return;
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
        if (!mapRef.current)
            return;
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
            const marker = L.marker([facility.latitude, facility.longitude], { icon, interactive: true }).addTo(mapRef.current);
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
        if (!mapRef.current)
            return;
        if (userMarkerRef.current) {
            userMarkerRef.current.remove();
            userMarkerRef.current = null;
        }
        if (!userPosition || geoLoading || geoDenied)
            return;
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
        userMarkerRef.current = L.marker([latitude, longitude], { icon, interactive: false, zIndexOffset: 1000 }).addTo(mapRef.current);
        // Re-render on position change (nav tracking updates userPosition)
    }, [userPosition, geoLoading, geoDenied]);
    // ── Camera: focus the user's location on the first real fix ──
    // Opening the app should land on "where am I", not on DEFAULT_CENTER.
    // Keyed to the MAP INSTANCE (not a boolean) so a re-created map — React
    // StrictMode's double-mount removes and rebuilds it — still gets focused.
    // Camera moves use setView: Leaflet's flyTo flight loop is unreliable here.
    const focusedUserMapRef = useRef(null);
    useEffect(() => {
        if (!mapRef.current || focusedUserMapRef.current === mapRef.current)
            return;
        if (!userPosition || geoLoading || geoDenied || isNavigating)
            return;
        focusedUserMapRef.current = mapRef.current;
        mapRef.current.setView([userPosition.latitude, userPosition.longitude], 15, {
            animate: true,
            duration: 0.75,
        });
    }, [userPosition, geoLoading, geoDenied, isNavigating]);
    // ── Camera: selecting a center moves the map to that center ──
    // One move per (map instance, selection) — never while navigating, where
    // the navigation follow effect owns the camera.
    //
    // Mobile: the detail sheet owns the lower half of the screen, so dead
    // center hides the marker behind it. The target center is shifted H/6
    // BELOW the facility, which lands the marker at the 1/3 line from the
    // top — comfortably above the sheet. Desktop keeps the exact center.
    const lastCenterMoveRef = useRef({ map: null, id: null });
    useEffect(() => {
        if (!mapRef.current || !selectedCenter || isNavigating)
            return;
        const last = lastCenterMoveRef.current;
        if (last.map === mapRef.current && last.id === selectedCenter.id)
            return;
        lastCenterMoveRef.current = { map: mapRef.current, id: selectedCenter.id };
        const map = mapRef.current;
        const zoom = 15;
        const marker = L.latLng(selectedCenter.latitude, selectedCenter.longitude);
        let target = marker;
        if (window.matchMedia('(max-width: 767px)').matches) {
            const point = map.project(marker, zoom);
            point.y += Math.round(map.getSize().y / 6);
            target = map.unproject(point, zoom);
        }
        map.setView(target, zoom, { animate: true, duration: 0.75 });
    }, [selectedCenter, isNavigating]);
    // ── Route line: dashed polyline, animated flyToBounds ──
    useEffect(() => {
        if (!mapRef.current)
            return;
        if (routeLineRef.current) {
            routeLineRef.current.remove();
            routeLineRef.current = null;
        }
        if (!routeData || routeData.distance === 0)
            return;
        const latLngs = geojsonToLatLngs(routeData.geometry);
        if (latLngs.length === 0)
            return;
        const line = L.polyline(latLngs, {
            color: '#4A72FF',
            weight: 6,
            opacity: 0.95,
            className: 'route-line',
            lineCap: 'round',
            lineJoin: 'round',
        }).addTo(mapRef.current);
        routeLineRef.current = line;
        // Draw the route in: measure the path and let the stroke reveal it.
        const path = line.getElement?.();
        if (path && typeof path.getTotalLength === 'function') {
            const length = path.getTotalLength();
            path.style.setProperty('--route-path-length', String(length));
            path.classList.add('animate-route-draw');
        }
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
        if (navWatchActive.current)
            return;
        navWatchId.current = navigator.geolocation.watchPosition((pos) => {
            if (!mapRef.current)
                return;
            const { latitude, longitude } = pos.coords;
            mapRef.current.panTo([latitude, longitude], { animate: true, duration: 0.5 });
        }, () => { }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 });
        navWatchActive.current = true;
        return () => {
            navigator.geolocation.clearWatch(navWatchId.current);
            navWatchActive.current = false;
        };
    }, [isNavigating, userPosition, geoDenied]);
    return null;
}
