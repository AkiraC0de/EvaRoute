import type { MutableRefObject } from 'react';
import L from 'leaflet';

/**
 * RecenterButton — floating white circle that re-centers the map on the
 * user's current location (or default center if geolocation unavailable).
 *
 * Reflects the Figma design: white circular icon button, floating on the
 * map, bottom-right for mobile, similar for desktop.
 *
 * During navigation, the map is already following the user, so the button
 * remains visible for manual re-center but the map auto-centers on position
 * updates.
 */
interface RecenterButtonProps {
  mapRef: MutableRefObject<L.Map | null>;
  position?: { latitude: number; longitude: number } | null;
  defaultCenter?: [number, number];
  className?: string;
}

export default function RecenterButton({
  mapRef,
  position,
  defaultCenter,
  className = '',
}: RecenterButtonProps) {
  function handleRecenter() {
    if (!mapRef.current) return;
    const target =
      position != null
        ? [position.latitude, position.longitude]
        : defaultCenter ?? [14.5964, 120.9736];
    mapRef.current.flyTo(
      target as L.LatLngExpression,
      14,
      { duration: 1.0, easeLinearity: 0.25 }
    );
  }

  return (
    <button
      className={`recenter-button ${className}`}
      onClick={handleRecenter}
      aria-label="Recenter on your location"
      title="Recenter"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
      </svg>
    </button>
  );
}
