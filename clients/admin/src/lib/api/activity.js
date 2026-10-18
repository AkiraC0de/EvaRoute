/**
 * Activity log endpoints (FETCH_ACTIVITY). All calls go through the shared
 * `request()` core — see client.js.
 */

import { request } from "./client.js";

/**
 * GET /api/v1/activity  (FETCH_ACTIVITY)
 * Query: { facilityId?, action? (comma-separated), actorId?, from?, to?,
 *          cursor?, limit? (1..50, default 20) }
 * FACILITY_STAFF is scoped server-side to their own facility.
 * Response data: { activities, nextCursor }.
 */
export async function listActivity(query = {}) {
  const params = new URLSearchParams();
  if (query.facilityId) params.set("facilityId", query.facilityId);
  if (query.action) params.set("action", query.action);
  if (query.actorId) params.set("actorId", query.actorId);
  if (query.search) params.set("search", query.search);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.cursor) params.set("cursor", query.cursor);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  const { data } = await request(`/activity${qs ? `?${qs}` : ""}`);
  return {
    activities: data.activities ?? [],
    nextCursor: data.nextCursor ?? null,
    // Offset-mode pagination metadata (null in cursor mode)
    total: data.total ?? null,
    page: data.page ?? 1,
    pageSize: data.pageSize ?? query.limit ?? 20,
    totalPages: data.totalPages ?? null,
  };
}

/**
 * GET /api/v1/activity/stats  (FETCH_ACTIVITY)
 * Accurate DB-aggregated counts grouped by action (default window: last 7
 * days). FACILITY_STAFF is scoped server-side to their own facility.
 * Response data: { total, byAction: { [action]: number }, since, until }.
 * Pass interval: "day" to also get zero-filled per-day timeline buckets:
 *   timeline: [{ date: "YYYY-MM-DD", total, checkIns, checkOuts }] (UTC days)
 */
export async function listActivityStats({ from, to, interval, facilityId } = {}) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (interval) params.set("interval", interval);
  if (facilityId) params.set("facilityId", facilityId);
  const qs = params.toString();
  const { data } = await request(`/activity/stats${qs ? `?${qs}` : ""}`);
  return {
    total: data.total ?? 0,
    byAction: data.byAction ?? {},
    timeline: data.timeline ?? null,
    since: data.since,
    until: data.until,
  };
}
