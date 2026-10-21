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

/**
 * The page's ONE shared band split: the hero band and the operations band
 * (and the loading skeleton that mirrors them) use the same column fractions
 * so their column seams align down the page.
 */
export const BAND_COLS = "lg:grid-cols-[1.45fr_1fr]";

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

/** Flatten active stays into person rows for the individual view:
 *  [{ member, stay }] in stay order, member order within each stay. */
export const flattenMembers = (stays = []) =>
  stays.flatMap((stay) =>
    (stay.members ?? []).map((member) => ({ member, stay })),
  );

/**
 * Individual lookup: the person's name (partial, case-insensitive), or the
 * family name, or the Check-In ID — so a person can be found from whichever
 * detail the operator knows.
 */
export const memberMatchesSearch = (entry, needle) => {
  const q = needle.trim().toLowerCase();
  if (!q) return true;
  return (
    entry.member.fullName.toLowerCase().includes(q) ||
    entry.stay.familyName.toLowerCase().includes(q) ||
    normalizeCode(entry.stay.checkInCode).includes(normalizeCode(q))
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

/**
 * Growth metrics for the breakdown tiles.
 *
 * Clock: `stay.checkedInAt` — the schema's arrival timestamp (there is no
 * createdAt on stays, and members carry no timestamp at all: a check-in
 * creates the whole member set at once, so members inherit their stay's
 * arrival time).
 *
 * Scope note (data reality): this counts ADDITIONS among the currently
 * active records — a family that arrived AND departed inside the window is
 * no longer in the ACTIVE list. Fine for a "new arrivals" chip and an
 * indicative trend line; not a full net-change ledger (the check-out log
 * has no per-category member counts). Returns `null` when the records carry
 * no arrival timestamps at all — never a confident fake zero.
 */
const DAY_MS = 24 * 60 * 60 * 1000;

const ageBucket = (member) =>
  member?.ageGroup === "CHILD" ? "children" : "adults";

const arrivalMs = (stay) => new Date(stay.checkedInAt).getTime();

const hasArrivals = (stays) =>
  stays.length === 0 || stays.some((stay) => Number.isFinite(arrivalMs(stay)));

/** Additions in the rolling last 24h: { households, children, adults }. */
export const last24hNew = (stays = []) => {
  if (!hasArrivals(stays)) return null;
  const cutoff = Date.now() - DAY_MS;
  const out = { households: 0, children: 0, adults: 0 };
  for (const stay of stays) {
    const arrived = arrivalMs(stay);
    if (!Number.isFinite(arrived) || arrived < cutoff) continue;
    out.households += 1;
    for (const member of stay.members ?? []) {
      out[ageBucket(member)] += 1;
    }
  }
  return out;
};

/** Additions per day for the last `days` days (index 0 = oldest, last = today):
 *  { households: number[], children: number[], adults: number[] }. */
export const newPerDay = (stays = [], days = 7) => {
  if (!hasArrivals(stays)) return null;
  const out = {
    households: Array(days).fill(0),
    children: Array(days).fill(0),
    adults: Array(days).fill(0),
  };
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const bucketOf = (ms) => {
    const dayStart = new Date(ms).setHours(0, 0, 0, 0);
    const index = days - 1 - Math.round((todayStart - dayStart) / DAY_MS);
    return index >= 0 && index < days ? index : null;
  };
  for (const stay of stays) {
    const arrived = arrivalMs(stay);
    if (!Number.isFinite(arrived)) continue;
    const index = bucketOf(arrived);
    if (index === null) continue;
    out.households[index] += 1;
    for (const member of stay.members ?? []) {
      out[ageBucket(member)][index] += 1;
    }
  }
  return out;
};
