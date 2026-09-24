import { useEffect } from 'react';
import { geojsonToLatLngs } from '../services/osrm';
import L from 'leaflet';

interface RouteLineProps {
  routeData: import('../services/osrm').OSRMRoute | null;
  mapRef: React.MutableRefObject<L.Map | null>;
  lineRef: React.MutableRefObject<L.Polyline | null>;
}

export default function RouteLine({ routeData, mapRef, lineRef }: RouteLineProps) {
  useEffect(() => {
    if (!mapRef.current) return;
    if (lineRef.current) {
      lineRef.current.remove();
      lineRef.current = null;
    }

    if (!routeData || routeData.distance === 0) return;

    const latLngs = geojsonToLatLngs(routeData.geometry);
    if (latLngs.length === 0) return;

    const line = L.polyline(latLngs, {
      color: '#4A72FF',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(mapRef.current!);
    lineRef.current = line;

    mapRef.current.fitBounds(line.getBounds(), { padding: [60, 60] });
  }, [routeData]);

  return null;
}
