/**
 * Facility status → marker/legend/pill presentation — the ONE mapping used by
 * the map markers, the legend and any status chip on map surfaces. Mirrors the
 * backend `FacilityStatus` enum (AVAILABLE / UNAVAILABLE) and tolerates the
 * LIMITED value that exists as DB drift — never invent a status meaning here.
 *
 * Marker colors are named CSS classes (see map.css) so they resolve from the
 * design tokens instead of raw hex.
 */
export const FACILITY_STATUS_META = {
  AVAILABLE: { label: "Available", tone: "success", markerClass: "clay-marker--available" },
  UNAVAILABLE: { label: "Unavailable", tone: "danger", markerClass: "clay-marker--unavailable" },
  LIMITED: { label: "Limited", tone: "warning", markerClass: "clay-marker--limited" },
};

export const statusMetaOf = (status) =>
  FACILITY_STATUS_META[status] ?? {
    label: String(status ?? "Unknown"),
    tone: "neutral",
    markerClass: "clay-marker--unknown",
  };

/** Legend order is fixed so colors never shuffle between renders. */
export const LEGEND_ITEMS = ["AVAILABLE", "UNAVAILABLE", "LIMITED"].map((status) => ({
  status,
  ...FACILITY_STATUS_META[status],
}));
