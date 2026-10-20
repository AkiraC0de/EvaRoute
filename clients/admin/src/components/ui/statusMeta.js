/**
 * Canonical record-status taxonomy — ONE mapping for every status chip in
 * the admin app (the map's marker presentation builds on it, see
 * features/map/statusColors.js).
 *
 * Mirrors the backend enums: `FacilityStatus` (AVAILABLE / UNAVAILABLE) and
 * account states (Active / Inactive). The LIMITED entry tolerates legacy DB
 * drift only — never invent a status meaning here.
 *
 * Rule from the theme audit: semantic colors (success / warning / danger)
 * mean STATUS. Category decoration never uses them.
 */
export const STATUS_META = {
  AVAILABLE: { label: "Available", tone: "success" },
  UNAVAILABLE: { label: "Unavailable", tone: "danger" },
  LIMITED: { label: "Limited", tone: "warning" },
  ACTIVE: { label: "Active", tone: "success" },
  INACTIVE: { label: "Inactive", tone: "danger" },
  VALID: { label: "Valid", tone: "success" },
  REVOKED: { label: "Revoked", tone: "danger" },
};

export const statusMetaOf = (status) =>
  STATUS_META[status] ?? { label: String(status ?? "Unknown"), tone: "neutral" };
