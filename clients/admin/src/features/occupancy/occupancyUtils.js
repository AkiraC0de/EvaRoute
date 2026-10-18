/**
 * Occupancy calculations and formatting for the staff Occupancy dashboard.
 *
 * Occupancy percentage = active stay members ÷ facility maxCapacity — the
 * server's own model (`GET /facility/:facilityId/stay/occupancy` counts
 * per-person, not per-household). Households are counted separately so the
 * two are never confused.
 *
 * Capacity thresholds (assumption — the project defines none elsewhere):
 *   FULL          remaining === 0        (danger)
 *   NEARLY_FULL   occupancy >= 85%      (warning)
 *   OPEN          otherwise             (success)
 * The 85% line is chosen so staff get notice before the last few seats go;
 * both thresholds are exported so a single edit moves the policy.
 */

export const NEARLY_FULL_PCT = 85;

export const occupancyPct = (members, capacity) =>
  capacity > 0 ? Math.round((Number(members) / capacity) * 100) : 0;

export const capacityState = (members, capacity) => {
  const remaining = Math.max(0, capacity - members);
  if (remaining === 0) {
    return { key: "FULL", label: "Full", tone: "danger" };
  }
  if (occupancyPct(members, capacity) >= NEARLY_FULL_PCT) {
    return { key: "NEARLY_FULL", label: "Nearly full", tone: "warning" };
  }
  return { key: "OPEN", label: "Open", tone: "success" };
};

/**
 * Check-In ID display: the server's per-facility ticket number ("0001").
 * Falls back to a short id segment if an old record predates the code.
 */
export const checkInCode = (stay) =>
  stay.checkInCode ? String(stay.checkInCode) : `#${String(stay.id).slice(0, 8)}`;

/** Strip separators/whitespace so "0001", " 0001 " and "#0001" all match. */
export const normalizeCode = (value) =>
  String(value ?? "").replace(/[^0-9a-z]/gi, "").toLowerCase();

/** Household lookup: family name (partial, case-insensitive) or Check-In ID. */
export const stayMatchesSearch = (stay, needle) => {
  const q = needle.trim().toLowerCase();
  if (!q) return true;
  const codeNeedle = normalizeCode(q);
  return (
    stay.familyName.toLowerCase().includes(q) ||
    (codeNeedle.length > 0 && normalizeCode(stay.checkInCode).includes(codeNeedle)) ||
    String(stay.id).toLowerCase().includes(q)
  );
};

/** Short, readable check-in timestamp: "Oct 15, 2:32 PM". */
export const formatCheckedInAt = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/** Household size split used on the ticket and summary captions. */
export const splitMembers = (members = []) => ({
  total: members.length,
  children: members.filter((m) => m.ageGroup === "CHILD").length,
  adults: members.filter((m) => m.ageGroup === "ADULT").length,
});

/**
 * Trend for the meter's sparkline: recent-7 vs prior-7 check-in totals from
 * the server's zero-filled daily timeline. Pure — no dates injected.
 */
export const checkinTrend = (timeline = []) => {
  const recent = timeline.slice(-7).reduce((sum, day) => sum + (day.checkIns ?? 0), 0);
  const prior = timeline.slice(-14, -7).reduce((sum, day) => sum + (day.checkIns ?? 0), 0);
  const delta = prior > 0 ? Math.round(((recent - prior) / prior) * 100) : recent > 0 ? 100 : 0;
  return {
    recent,
    prior,
    delta,
    direction: recent > prior ? "up" : recent < prior ? "down" : "flat",
  };
};
