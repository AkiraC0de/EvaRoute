/** Pure helpers for rendering activity rows (kept out of the .jsx files to
 *  satisfy react-refresh/only-export-components). */
import { humanizeKey } from "./detailFormat";

/** Human sentence for one log row: "Verify Admin updated facility X". */
export function describeActivity(log) {
  const actor = log.actorName || log.actorEmail || "Someone";
  const who = log.actorName ? log.actorName : log.actorEmail;
  const target = log.targetLabel || log.facilityName;
  const md = log.metadata ?? {};

  switch (log.action) {
    case "AUTH_LOGIN":
      return `${who} signed in`;
    case "AUTH_SIGN_OUT":
      return `${who} signed out`;
    case "AUTH_SIGN_OUT_ALL":
      return `${who} signed out of all devices`;
    case "AUTH_PASSWORD_RESET_REQUESTED":
      return `${who} requested a password reset`;
    case "AUTH_PASSWORD_RESET":
      return `${who} reset their password`;
    case "FACILITY_CREATED":
      return `${who} registered facility ${q(target)}`;
    case "FACILITY_UPDATED":
      return `${who} updated facility ${q(target)}${fieldSummary(md)}`;
    case "FACILITY_DELETED":
      return `${who} deleted facility ${q(target)}`;
    case "FACILITY_RESTORED":
      return `${who} restored facility ${q(target)}`;
    case "STAFF_ACCOUNT_CREATED":
      return `${who} created staff account ${q(target)}`;
    case "STAFF_ACCOUNT_UPDATED":
      return `${who} updated staff account ${q(target)}`;
    case "STAFF_ACTIVATED":
      return `${who} activated ${q(target)}`;
    case "STAFF_DEACTIVATED":
      return `${who} deactivated ${q(target)}`;
    case "STAFF_PASSWORD_RESET":
      return `${who} reset the password for ${q(target)}`;
    case "STAFF_DELETED":
      return `${who} deleted staff account ${q(target)}`;
    case "STAFF_ASSIGNED":
      return md.transferredFrom
        ? `${who} transferred ${q(target)} from ${q(md.transferredFrom)}`
        : `${who} assigned ${q(target)} to this facility`;
    case "STAFF_DISMISSED":
      return `${who} dismissed ${q(target)}`;
    case "RESOURCE_CREATED":
      return `${who} added resource ${q(target)}${valueSummary(md)}`;
    case "RESOURCE_UPDATED":
      return `${who} updated resource ${q(target)}${changeSummary(md)}`;
    case "RESOURCE_DELETED":
      return `${who} removed resource ${q(target)}`;
    case "STAY_CHECKED_IN":
      return `${who} checked in ${q(md.familyName ?? target)} · ${md.members ?? "?"} member${md.members === 1 ? "" : "s"} (${md.adults ?? 0} adult${md.adults === 1 ? "" : "s"}, ${md.children ?? 0} child${md.children === 1 ? "" : "s"})`;
    case "STAY_CHECKED_OUT":
      return `${who} checked out ${q(md.familyName ?? target)}${durationSummary(md)}`;
    default:
      return `${actor} performed ${log.action}`;
  }
}

/** Relative-ish timestamp: "Today 14:32", "Oct 14, 09:15". */
export function formatActivityTime(iso) {
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const time = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `Today ${time}`;
  return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${time}`;
}

/** Timeline group heading for one calendar day: "Today" / "Yesterday" / "Monday, October 13". */
export function dayLabel(iso) {
  const date = new Date(iso);
  const now = new Date();
  const startOf = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(date)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

const q = (value) => (value ? `“${value}”` : "");

function fieldSummary(md) {
  const keys = md.after && typeof md.after === "object" ? Object.keys(md.after) : [];
  // Render field names the way the detail panel does ("In stock", not
  // "isAvailable") — raw model keys never reach user-facing copy.
  return keys.length ? ` (${keys.map(humanizeKey).join(", ")})` : "";
}

function valueSummary(md) {
  if (md.type === "BOOLEAN") return md.isAvailable ? " · available" : " · unavailable";
  if (md.type === "QUANTITY" && md.maxValue != null) return ` · ${md.availableValue ?? 0} of ${md.maxValue}`;
  return "";
}

function changeSummary(md) {
  const before = md.before ?? {};
  const after = md.after ?? {};
  if (before.availableValue !== after.availableValue && after.availableValue != null) {
    return ` · ${before.availableValue ?? 0} → ${after.availableValue}${after.maxValue != null ? ` of ${after.maxValue}` : ""}`;
  }
  const keys = Object.keys(after).filter((k) => before[k] !== after[k]);
  // Same rule as fieldSummary: raw model keys never reach user-facing copy.
  return keys.length ? ` (${keys.map(humanizeKey).join(", ")})` : "";
}

function durationSummary(md) {
  const m = md.durationMinutes;
  if (m == null) return "";
  if (m < 60) return ` · stayed ${m} min`;
  const h = Math.floor(m / 60);
  return ` · stayed ${h}h ${m % 60}m`;
}
