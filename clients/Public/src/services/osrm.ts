/**
 * OSRM Routing Service
 *
 * Uses the public OSRM demo server for route calculation.
 * For production use, deploy a dedicated OSRM instance.
 *
 * OSRM expects coordinates as [longitude, latitude].
 * Leaflet uses [latitude, longitude].
 *
 * Public OSRM endpoint:
 *   https://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}
 */

const OSRM_BASE = 'https://router.project-osrm.org';

export interface OSRMRoute {
  distance: number;   // meters
  duration: number;   // seconds
  geometry: GeoJSON.Feature<GeoJSON.LineString> | GeoJSON.LineString;
  legs: OSRMLeg[];
}

export interface OSRMLeg {
  steps: OSRMStep[];
}

export interface OSRMStep {
  maneuver: string;
  location: [number, number]; // [lng, lat]
}

const EMPTY_ROUTE: OSRMRoute = {
  distance: 0,
  duration: 0,
  geometry: {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [],
    },
  },
  legs: [],
};

export async function getRoute(
  start: [number, number], // [lng, lat]
  end: [number, number],   // [lng, lat]
): Promise<OSRMRoute> {
  const url = `${OSRM_BASE}/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson&steps=true`;

  try {
    const response = await fetch(url);
    if (!response.ok) return EMPTY_ROUTE;

    const data = await response.json();
    if (!data.routes || data.routes.length === 0) return EMPTY_ROUTE;

    const route = data.routes[0];

    return {
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry as GeoJSON.Feature<GeoJSON.LineString> | GeoJSON.LineString,
      legs: route.legs?.map((leg: any) => ({
        steps: leg.steps?.map((step: any) => ({
          maneuver: step.maneuver?.type?.replace('_', ' ') || 'Continue',
          location: step.location as [number, number],
        })) || [],
      })) || [],
    };
  } catch {
    return EMPTY_ROUTE;
  }
}

/**
 * Convert GeoJSON coordinates [lng, lat] to Leaflet positions [lat, lng].
 */
export function geojsonToLatLngs(geometry: GeoJSON.Feature<GeoJSON.LineString> | GeoJSON.LineString): [number, number][] {
  const coords = 'geometry' in geometry
    ? geometry.geometry.coordinates  // Feature wrapper
    : geometry.coordinates;          // Bare LineString
  return (coords as [number, number][]).map(([lng, lat]) => [lat, lng]);
}
