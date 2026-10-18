/**
 * Dashboard endpoints (FETCH_DASHBOARD). All calls go through the shared
 * `request()` core — see client.js.
 */

import { request } from "./client.js";

/**
 * GET /api/v1/dashboard/summary  (FETCH_DASHBOARD)
 * One aggregate for the admin Overview: facility states, live occupancy from
 * active stays, staff states, rolling 24h/7d activity windows and per-facility
 * load. ADMIN sees the network (optional facilityId scope); FACILITY_STAFF is
 * forced server-side to their own facility.
 * Response data: { scope, facilities, capacity, occupants, staff, activity,
 *                  facilityLoad: [{ id, name, status, maxCapacity, occupied,
 *                                   families, pct }] }
 */
export async function getDashboardSummary({ facilityId } = {}) {
  const params = new URLSearchParams();
  if (facilityId) params.set("facilityId", facilityId);
  const qs = params.toString();
  const { data } = await request(`/dashboard/summary${qs ? `?${qs}` : ""}`);
  return data;
}
