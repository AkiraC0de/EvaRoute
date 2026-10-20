/**
 * Facility status → marker/legend presentation for MAP surfaces. The
 * label/tone taxonomy is imported from components/ui/statusMeta (the ONE
 * mapping — never invent a status meaning here); this module only adds the
 * marker CSS classes (see map.css) so colors resolve from design tokens.
 */
import { STATUS_META } from "../../components/ui/statusMeta";

export const FACILITY_STATUS_META = {
  AVAILABLE: { ...STATUS_META.AVAILABLE, markerClass: "map-marker--available" },
  UNAVAILABLE: { ...STATUS_META.UNAVAILABLE, markerClass: "map-marker--unavailable" },
  LIMITED: { ...STATUS_META.LIMITED, markerClass: "map-marker--limited" },
};

export const statusMetaOf = (status) =>
  FACILITY_STATUS_META[status] ?? {
    label: String(status ?? "Unknown"),
    tone: "neutral",
    markerClass: "map-marker--unknown",
  };

/** Legend order is fixed so colors never shuffle between renders. */
export const LEGEND_ITEMS = ["AVAILABLE", "UNAVAILABLE", "LIMITED"].map((status) => ({
  status,
  ...FACILITY_STATUS_META[status],
}));
