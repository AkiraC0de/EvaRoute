/**
 * Shared app constants — one home, no inline magic numbers.
 */

/** Map fallback centre (Manila). NEVER treated as the user's position. */
export const DEFAULT_CENTER = [14.5964, 120.9736];

/** Arrival is declared when the user is within this many metres of the center. */
export const ARRIVAL_THRESHOLD_M = 50;

/** Maximum search radius the backend accepts (see PUBLIC_FACILITY.MAX_DISTANCE_KM). */
export const MAX_DISTANCE_KM = 200;

/** Backend default radius when the user has not expanded the search (km). */
export const DEFAULT_SEARCH_RADIUS_KM = 10;
