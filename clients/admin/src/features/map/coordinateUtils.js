/**
 * Coordinate parsing/validation shared by the picker, the overview map and the
 * facility forms. The API stores lat/lng as Prisma Decimals, so list payloads
 * may hand us strings — everything goes through these helpers first.
 */

export const isValidLatitude = (value) => {
  // Number("") and Number(null) coerce to 0 — an empty picker value must not
  // look like a valid equator coordinate.
  if (value === "" || value === null || value === undefined) return false;
  const n = Number(value);
  return Number.isFinite(n) && n >= -90 && n <= 90;
};

export const isValidLongitude = (value) => {
  if (value === "" || value === null || value === undefined) return false;
  const n = Number(value);
  return Number.isFinite(n) && n >= -180 && n <= 180;
};

/** True only when both halves are present and inside valid ranges. */
export const isValidCoords = (latitude, longitude) =>
  isValidLatitude(latitude) && isValidLongitude(longitude);

/** Normalized numbers for map APIs, or null when the pair is unusable. */
export const toCoords = (latitude, longitude) =>
  isValidCoords(latitude, longitude)
    ? { latitude: Number(latitude), longitude: Number(longitude) }
    : null;

/** "14.5995, 120.9842" style readout for the form's location line. */
export const formatCoords = (latitude, longitude) =>
  isValidCoords(latitude, longitude)
    ? `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`
    : "";
