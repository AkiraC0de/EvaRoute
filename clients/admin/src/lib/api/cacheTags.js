/**
 * Cache tags: the vocabulary mutations invalidate by. ONE source of truth —
 * a missed rule is a stale screen after a mutation. Rules are matched in
 * order (first wins) against `${method} ${path}` with the query string
 * stripped; keep more specific rules ABOVE the general ones they shadow.
 *
 * `CLEAR_ALL` wipes the whole cache — user/role switches must never serve
 * the previous account's data.
 */
export const TAGS = {
  dashboard: "dashboard",
  stays: "stays",
  activity: "activity",
  facilities: "facilities",
  resources: "resources",
  staff: "staff",
};

export const CLEAR_ALL = "*";

const T = TAGS;

/** What a check-out can move: the stays list, occupancy-derived facility
 *  counts, the movement trail and the dashboard aggregates. Also used by the
 *  bulk check-out loop's single end-of-batch refresh (batch mode skips the
 *  per-request invalidation — see the request() seam). */
export const BULK_CHECKOUT_TAGS = [T.stays, T.facilities, T.activity, T.dashboard];

const RULES = [
  // User/role switch — nothing from the previous session may survive.
  ["POST /auth/login|POST /auth/signout|POST /auth/signout-all", [CLEAR_ALL]],
  // Bulk registry toggle (loops of single toggles also match below).
  ["POST /facility/bulk-toggle", [T.facilities, T.activity, T.dashboard]],
  // Check-out before check-in (the /stay/:id/checkout shape).
  ["POST /facility/[^/]+/stay/[^/]+/checkout", BULK_CHECKOUT_TAGS],
  ["POST /facility/[^/]+/stay", [T.stays, T.facilities, T.activity, T.dashboard]],
  // Resources (before the general /facility/:id rules that would shadow them).
  ["(POST|PATCH|DELETE) /facility/[^/]+/resource", [T.resources, T.facilities, T.activity, T.dashboard]],
  // Facility staff assign / transfer / dismiss.
  ["(POST|DELETE) /facility/[^/]+/staff", [T.staff, T.facilities, T.activity, T.dashboard]],
  // Staff account lifecycle (create matches the bare /staff rule last).
  ["(PATCH|DELETE) /staff/[^/]+", [T.staff, T.facilities, T.activity, T.dashboard]],
  ["POST /staff/[^/]+", [T.staff, T.facilities, T.activity, T.dashboard]],
  ["POST /staff", [T.staff, T.activity]],
  // Facility registry mutations (patch/delete/toggle/create).
  ["(PATCH|DELETE) /facility/[^/]+", [T.facilities, T.activity, T.dashboard]],
  ["POST /facility", [T.facilities, T.activity, T.dashboard]],
  // /auth/password/* and /auth/account-setup: session-scoped identity — the
  // query cache holds no secrets and nothing these change is cached. Fall
  // through to [] .
];

export function tagsForMutation(method, path) {
  const subject = `${method} ${path.split("?")[0]}`;
  for (const [pattern, tags] of RULES) {
    if (new RegExp(`^(?:${pattern})`).test(subject)) return tags;
  }
  return [];
}
