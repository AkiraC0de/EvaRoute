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
/**
 * Client-side hard stop for the route request — a hung backend must never
 * leave the UI on "Calculating the best route…" forever. Slightly above the
 * server's own routing-upstream timeout so the server's error wins when it
 * answers at all.
 */
const ROUTE_FETCH_TIMEOUT_MS = 15000;
/**
 * Map GraphHopper's instruction `sign` onto the maneuver vocabulary
 * TurnInstruction renders (its icon map keys). Documented sign values
 * (graphhopper docs/web/api-doc.md):
 *   KEEP_LEFT=-7, TURN_SHARP_LEFT=-3, TURN_LEFT=-2, TURN_SLIGHT_LEFT=-1,
 *   CONTINUE_ON_STREET=0, TURN_SLIGHT_RIGHT=1, TURN_RIGHT=2,
 *   TURN_SHARP_RIGHT=3, FINISH=4, REACHED_VIA=5, USE_ROUNDABOUT=6, KEEP_RIGHT=7
 * Some builds encode U-turns as -98/-97. Anything else returns undefined and
 * TurnInstruction falls back to its generic arrow.
 */
function maneuverTypeFromSign(sign) {
    switch (sign) {
        case -3: return 'turn_left';
        case -2: return 'turn_left';
        case -1: return 'left';
        case 0: return 'continue';
        case 1: return 'right';
        case 2: return 'turn_right';
        case 3: return 'turn_right';
        case -7: return 'left';
        case 7: return 'right';
        case 6: return 'turn_right';
        case -98: return 'uturn_left';
        case -97: return 'uturn_right';
        case 4:
        case 5:
            return 'continue';
        default: return undefined;
    }
}
/**
 * Fetch a route from the user's location to a facility via the EvaRoute
 * backend.
 *
 * Returns the parsed route, or null when the backend answers successfully
 * with no usable route — callers should treat null as "route unavailable".
 *
 * Transport and protocol failures (timeout, network error, non-2xx status,
 * failure envelope `{ message, data: { errors } }`) THROW an Error with a
 * user-facing message so callers can show an error state with retry instead
 * of masking the failure as "route unavailable".
 */
export async function getRouteToFacility(facilityId, fromLong, fromLat) {
    const url = `${PUBLIC_ROUTE_URI}/${encodeURIComponent(facilityId)}?fromLong=${fromLong}&fromLat=${fromLat}`;
    let response;
    try {
        response = await fetch(url, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(ROUTE_FETCH_TIMEOUT_MS),
        });
    }
    catch (err) {
        throw new Error(err?.name === 'TimeoutError'
            ? 'The route request timed out. Please try again.'
            : 'Could not reach the routing service. Check your connection and try again.');
    }
    let body = null;
    try {
        body = await response.json();
    }
    catch {
        body = null;
    }
    // Failure envelope: { message, data: { errors } } (plus the legacy
    // success/isSuccess flags) — surface the server's message as an error.
    const failureEnvelope = body != null &&
        (body.success === false ||
            body.isSuccess === false ||
            (body.data != null && body.data.errors != null));
    if (!response.ok || failureEnvelope) {
        throw new Error((typeof body?.message === 'string' && body.message) ||
            `The routing service rejected the request (HTTP ${response.status}). Please try again.`);
    }
    try {
        const data = body?.data;
        if (!data)
            return null;
        const path = data.paths?.[0];
        if (!path ||
            typeof path.distance !== 'number' ||
            typeof path.time !== 'number' ||
            !path.points) {
            return null;
        }
        // GraphHopper time is in milliseconds; the UI expects seconds.
        const durationSeconds = path.time / 1000;
        // Map GraphHopper instructions to navigation steps.
        // interval[0] indexes into path.points.coordinates.
        const points = path.points;
        const steps = (path.instructions ?? []).map((inst) => {
            let location = [0, 0];
            if (Array.isArray(inst.interval) &&
                inst.interval.length >= 2 &&
                Array.isArray(points.coordinates)) {
                const coords = points.coordinates[inst.interval[0]];
                if (Array.isArray(coords) && coords.length >= 2) {
                    location = [coords[0], coords[1]];
                }
            }
            return {
                text: inst.text ?? 'Continue',
                location,
                // Per-step length in METERS (GraphHopper instruction.distance):
                // the turn card shows this — not the remaining distance to the
                // center (PUB-06).
                distance: typeof inst.distance === 'number' ? inst.distance : undefined,
                maneuverType: maneuverTypeFromSign(inst.sign),
            };
        });
        return {
            distance: path.distance,
            duration: durationSeconds,
            geometry: path.points,
            legs: [{ steps }],
        };
    }
    catch {
        return null;
    }
}
/**
 * Convert GeoJSON coordinates [lng, lat] to Leaflet positions [lat, lng].
 */
export function geojsonToLatLngs(geometry) {
    const coords = 'geometry' in geometry
        ? geometry.geometry.coordinates
        : geometry.coordinates;
    return coords.map(([lng, lat]) => [lat, lng]);
}
