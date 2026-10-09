/**
 * EvaRoute Routing Service
 *
 * Routes through EvaRoute's backend GraphHopper endpoint:
 *   GET /api/v1/public/route/:facilityId?fromLong=<lng>&fromLat=<lat>
 *
 * The backend handles the GraphHopper API key server-side; the frontend
 * never calls GraphHopper directly and never exposes the key.
 *
 * GraphHopper returns `paths[]` with:
 *   - distance  in meters
 *   - time      in milliseconds
 *   - points    GeoJSON LineString (points_encoded=false)
 *   - instructions  turn-by-turn steps with interval indices
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const PUBLIC_ROUTE_URI = `${BASE_URL}/api/v1/public/route`;

export interface RouteStep {
  text: string;
  location: [number, number]; // [lng, lat]
}

export interface RouteLeg {
  steps: RouteStep[];
}

export interface RouteData {
  distance: number;   // meters
  duration: number;   // seconds
  geometry: GeoJSON.Feature<GeoJSON.LineString> | GeoJSON.LineString;
  legs: RouteLeg[];
}

interface GraphHopperInstruction {
  text?: string;
  interval?: [number, number];
}

interface GraphHopperPath {
  distance: number;
  time: number; // milliseconds
  points: GeoJSON.LineString;
  instructions?: GraphHopperInstruction[];
}

interface GraphHopperResponse {
  paths?: GraphHopperPath[];
}

/**
 * Fetch a route from the user's location to a facility via the EvaRoute
 * backend.
 *
 * Returns null when the facility is not found, the routing provider
 * fails, or the response shape is unexpected — callers should treat
 * null as "route unavailable" and show the appropriate UI state.
 */
export async function getRouteToFacility(
  facilityId: string,
  fromLong: number,
  fromLat: number,
): Promise<RouteData | null> {
  const url = `${PUBLIC_ROUTE_URI}/${encodeURIComponent(facilityId)}?fromLong=${fromLong}&fromLat=${fromLat}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return null;

    const body = await response.json();
    const data: GraphHopperResponse | undefined = body?.data;
    if (!data) return null;

    const path = data.paths?.[0];
    if (
      !path ||
      typeof path.distance !== 'number' ||
      typeof path.time !== 'number' ||
      !path.points
    ) {
      return null;
    }

    // GraphHopper time is in milliseconds; the UI expects seconds.
    const durationSeconds = path.time / 1000;

    // Map GraphHopper instructions to navigation steps.
    // interval[0] indexes into path.points.coordinates.
    const points = path.points as GeoJSON.LineString;
    const steps: RouteStep[] = (path.instructions ?? []).map(
      (inst: GraphHopperInstruction) => {
        let location: [number, number] = [0, 0];
        if (
          Array.isArray(inst.interval) &&
          inst.interval.length >= 2 &&
          Array.isArray(points.coordinates)
        ) {
          const coords = points.coordinates[inst.interval[0]];
          if (Array.isArray(coords) && coords.length >= 2) {
            location = [coords[0], coords[1]];
          }
        }
        return {
          text: inst.text ?? 'Continue',
          location,
        };
      },
    );

    return {
      distance: path.distance,
      duration: durationSeconds,
      geometry: path.points,
      legs: [{ steps }],
    };
  } catch {
    return null;
  }
}

/**
 * Convert GeoJSON coordinates [lng, lat] to Leaflet positions [lat, lng].
 */
export function geojsonToLatLngs(
  geometry: GeoJSON.Feature<GeoJSON.LineString> | GeoJSON.LineString,
): [number, number][] {
  const coords =
    'geometry' in geometry
      ? geometry.geometry.coordinates // Feature wrapper
      : geometry.coordinates; // Bare LineString
  return (coords as [number, number][]).map(([lng, lat]) => [lat, lng]);
}
