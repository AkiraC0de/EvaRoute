/**
 * Presentation helpers for `FacilityResource` records returned by the API.
 *
 * The backend model (server/prisma/schema.prisma -> FacilityResource) has only:
 *   id, facilityId, name, type ("QUANTITY" | "BOOLEAN"),
 *   isAvailable (BOOLEAN only), availableValue + maxValue (QUANTITY only)
 *
 * There is no "subtitle", "unit" or "stock percentage" column, so anything the
 * cards show beyond those fields is DERIVED here from real values rather than
 * stored as demo data.
 */

export function isQuantity(resource) {
  return resource?.type === "QUANTITY";
}

/**
 * Percentage of the maximum the facility still holds.
 * Returns null when the record cannot produce a meaningful percentage, so the
 * card can hide the bar instead of drawing a fake one.
 */
export function stockPercentage(resource) {
  if (!isQuantity(resource)) return null;

  const { availableValue, maxValue } = resource;
  if (typeof availableValue !== "number" || typeof maxValue !== "number") {
    return null;
  }
  if (maxValue <= 0) return null;

  return Math.max(0, Math.min(100, Math.round((availableValue / maxValue) * 100)));
}

/** The headline value shown on a card. */
export function displayValue(resource) {
  if (isQuantity(resource)) {
    return typeof resource.availableValue === "number"
      ? String(resource.availableValue)
      : "—";
  }

  if (resource.isAvailable === true) return "Available";
  if (resource.isAvailable === false) return "Unavailable";
  return "—";
}

/** Secondary line under the resource name. */
export function displaySubtitle(resource) {
  if (isQuantity(resource)) {
    return typeof resource.maxValue === "number"
      ? `Counted stock · max ${resource.maxValue}`
      : "Counted stock";
  }
  return "Availability";
}

export function displayUnit(resource) {
  return isQuantity(resource) ? "available" : undefined;
}
