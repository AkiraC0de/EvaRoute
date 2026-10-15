/**
 * Pure helpers for rendering activity metadata as human-readable detail
 * rows (instead of raw JSON). Kept separate from the .jsx files to satisfy
 * react-refresh/only-export-components.
 */

/** Human labels for the metadata keys the server writes. */
const KEY_LABELS = {
  familyName: "Family",
  members: "Members",
  adults: "Adults",
  children: "Children",
  durationMinutes: "Duration",
  stayId: "Stay ID",
  type: "Type",
  availableValue: "Available",
  maxValue: "Capacity",
  isAvailable: "In stock",
  keepLogin: "Kept signed in",
  transferredFrom: "Transferred from",
  maxCapacity: "Max capacity",
  firstName: "First name",
  lastName: "Last name",
  status: "Status",
  name: "Name",
  address: "Address",
  note: "Note",
  latitude: "Latitude",
  longitude: "Longitude",
};

/** Internal-reference keys render last and stay visually quiet. */
const LOW_PRIORITY_KEYS = ["stayId"];

/** Semantic display order (JSONB reorders stored keys, so never rely on
 *  insertion order). Unknown keys fall in alphabetically after the knowns. */
const KEY_ORDER = [
  "familyName",
  "members",
  "adults",
  "children",
  "durationMinutes",
  "transferredFrom",
  "name",
  "type",
  "isAvailable",
  "availableValue",
  "maxValue",
  "maxCapacity",
  "status",
  "firstName",
  "lastName",
  "keepLogin",
  "address",
  "note",
  "latitude",
  "longitude",
];

function keyOrder(key) {
  const index = KEY_ORDER.indexOf(key);
  return index === -1 ? 100 : index;
}

export function humanizeKey(key) {
  if (KEY_LABELS[key]) return KEY_LABELS[key];
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function formatDuration(minutes) {
  const total = Number(minutes);
  if (!Number.isFinite(total) || total < 0) return "—";
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  return `${hours}h ${total % 60}m`;
}

export function formatDetailValue(key, value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (key === "durationMinutes") return formatDuration(value);
  if (key === "stayId") return String(value).slice(0, 8);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * Turns one log's metadata into ordered detail rows:
 *   { kind: "field", label, value }        — a simple fact
 *   { kind: "diff", label, from, to }      — a before/after change
 */
export function buildDetailRows(metadata) {
  const md = metadata ?? {};
  const rows = [];
  const used = new Set();

  // before/after pairs become change rows (changed fields only).
  const before = md.before && typeof md.before === "object" ? md.before : null;
  const after = md.after && typeof md.after === "object" ? md.after : null;
  if (before && after) {
    used.add("before");
    used.add("after");
    for (const key of Object.keys({ ...before, ...after })) {
      if (before[key] === after[key]) continue;
      rows.push({
        kind: "diff",
        label: humanizeKey(key),
        from: formatDetailValue(key, before[key]),
        to: formatDetailValue(key, after[key]),
        priority: LOW_PRIORITY_KEYS.includes(key) ? 2 : 0,
        order: keyOrder(key),
      });
    }
  }

  // Remaining scalar fields become simple rows.
  for (const [key, value] of Object.entries(md)) {
    if (used.has(key)) continue;
    if (value !== null && typeof value === "object") continue; // unknown nesting: skip noise
    rows.push({
      kind: "field",
      label: humanizeKey(key),
      value: formatDetailValue(key, value),
      priority: LOW_PRIORITY_KEYS.includes(key) ? 2 : 1,
      order: keyOrder(key),
    });
  }

  // Interesting rows first, then semantic key order, internal refs last.
  return rows
    .map((row, index) => ({ row, index }))
    .sort(
      (a, b) =>
        a.row.priority - b.row.priority ||
        a.row.order - b.row.order ||
        a.row.label.localeCompare(b.row.label) ||
        a.index - b.index,
    )
    .map(({ row }) => row);
}

/**
 * Defense in depth: the server never logs secrets, but if one ever slipped
 * into metadata its value must not render in the UI. Keys that look
 * sensitive are masked before formatting.
 */
const SENSITIVE_KEY = /password|token|secret|otp|credential|authorization/i;

export function redact(value, keyHint = "") {
  if (Array.isArray(value)) return value.map((item) => redact(item, keyHint));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) =>
        SENSITIVE_KEY.test(k) ? [k, "••••••"] : [k, redact(v, k)],
      ),
    );
  }
  return SENSITIVE_KEY.test(keyHint) ? "••••••" : value;
}
