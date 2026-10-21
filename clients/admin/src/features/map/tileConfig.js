/**
 * Tile provider configuration — the single place that decides where map tiles
 * come from. OpenStreetMap's standard tiles are free with required
 * attribution; keep usage polite (public OSM tile usage policy) and swap the
 * URL here if a different OSM-compatible provider is ever needed.
 */
export const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
export const TILE_OPTIONS = {
  attribution: TILE_ATTRIBUTION,
  maxZoom: 19,
};

/** Fallback map center when no facility coordinates exist yet (Metro Manila). */
export const DEFAULT_CENTER = [14.5995, 120.9842];
export const DEFAULT_ZOOM = 11;
export const PICKER_ZOOM = 14;
/** Zoom level the camera flies to when a facility marker is clicked. */
export const FOCUS_ZOOM = 16;
