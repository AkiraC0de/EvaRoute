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
