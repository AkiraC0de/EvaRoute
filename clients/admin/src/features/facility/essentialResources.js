/**
 * Client mirror of the three mandatory essential resources
 * (server: server/src/utils/essentialResources.ts — keep in step).
 *
 * The server creates exactly these three rows for every facility and stores
 * the labels on the rows; this list drives the registration form's Resources
 * section. Keys are the stable identifiers (never match on display labels).
 */
export const ESSENTIAL_RESOURCES = [
  { key: "ELECTRICITY", label: "Electricity / Generator" },
  { key: "WATER", label: "Drinkable Water" },
  { key: "COMFORT_ROOM", label: "Comfort Room (CR)" },
];

/** Initial registration statuses, all Unavailable until set. */
export const defaultEssentialDraft = () =>
  Object.fromEntries(ESSENTIAL_RESOURCES.map((entry) => [entry.key, false]));
