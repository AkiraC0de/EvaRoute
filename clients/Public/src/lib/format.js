/**
 * Display formatters — the single place numbers become UI text.
 */

/** Kilometres with one decimal ("12.3 km"). */
export function formatKm(km) {
  return `${Number(km).toFixed(1)} km`;
}

/** Minutes rounded from seconds ("8 min"). */
export function formatMinutes(seconds) {
  return `${Math.round(Number(seconds) / 60)} min`;
}

/** Integer with locale grouping ("2,500"). */
export function formatCount(value) {
  return Number(value).toLocaleString();
}
