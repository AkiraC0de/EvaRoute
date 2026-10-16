/**
 * Pure facility list derivations for the discovery screen.
 *
 * Filtering and closest-first sorting used to be inline in App.tsx; they are
 * view-level derivations and belong next to the discovery feature.
 */

/** Case-insensitive name/address match plus status filter. */
export function filterFacilities(facilities, searchQuery, statusFilter) {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  return facilities.filter((facility) => {
    const matchesQuery =
      !normalizedSearchQuery ||
      facility.name.toLowerCase().includes(normalizedSearchQuery) ||
      facility.address.toLowerCase().includes(normalizedSearchQuery);
    const matchesStatus = statusFilter === 'ALL' || facility.status === statusFilter;
    return matchesQuery && matchesStatus;
  });
}

/**
 * Closest-first ordering of the already-filtered list.
 *
 * No real GPS fix → there is no "closest to user", so preserve the existing
 * order instead of ranking facilities around DEFAULT_CENTER. Ties keep their
 * relative order (Array#sort is stable) and records with unusable distance
 * sink to the end instead of jumping to the front.
 */
export function sortClosest(filteredFacilities, hasRealLocation) {
  if (!hasRealLocation) return filteredFacilities;
  return [...filteredFacilities].sort((a, b) => {
    const aDistance =
      typeof a.distance === 'number' && Number.isFinite(a.distance)
        ? a.distance
        : Number.POSITIVE_INFINITY;
    const bDistance =
      typeof b.distance === 'number' && Number.isFinite(b.distance)
        ? b.distance
        : Number.POSITIVE_INFINITY;
    if (aDistance === bDistance) return 0;
    return aDistance - bDistance;
  });
}
