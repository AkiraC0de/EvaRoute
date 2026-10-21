/**
 * Stays / occupancy endpoints (auth + FETCH_STAY / CHECK_IN / CHECK_OUT).
 * All calls go through the shared `request()` core — see client.js.
 */

import { request } from "./client.js";

/* ------------------------------------------------------------------ *
 * Stays / occupancy (auth + FETCH_STAY / CHECK_IN / CHECK_OUT)
 * ------------------------------------------------------------------ */

/**
 * GET /api/v1/facility/:facilityId/stay?status=ACTIVE|CHECKED_OUT
 * -> { stays, count }; each stay carries its `members`
 * (fullName + ageGroup CHILD|ADULT).
 */
export async function listStays(facilityId, status) {
  const params = status ? `?status=${status}` : "";
  const { data } = await request(`/facility/${facilityId}/stay${params}`);
  return data.stays ?? [];
}

/**
 * GET /api/v1/facility/:facilityId/stay/occupancy
 * -> { maxCapacity, families, adults, children, members, remaining }
 */
export async function getOccupancy(facilityId) {
  const { data } = await request(`/facility/${facilityId}/stay/occupancy`);
  return data;
}

/**
 * POST /api/v1/facility/:facilityId/stay  (CHECK_IN)
 * Body: { familyName, members: [{ fullName, ageGroup: "CHILD"|"ADULT" }] }
 * (one entry per person). 400 when the family does not fit in the remaining
 * capacity. Response data: { stay }.
 */
export async function checkIn(facilityId, payload) {
  const { data } = await request(`/facility/${facilityId}/stay`, {
    method: "POST",
    body: payload,
  });
  return data.stay;
}

/**
 * GET /api/v1/facility/:facilityId/stay/:stayId — one stay with its members
 * (permission-gated FETCH_STAY; names stay out of activity logs by design,
 * so the stay record is fetched on demand where names are shown).
 */
export async function getStay(facilityId, stayId) {
  const { data } = await request(`/facility/${facilityId}/stay/${stayId}`);
  return data.stay ?? null;
}

/** POST /api/v1/facility/:facilityId/stay/:stayId/checkout  (CHECK_OUT) */
export async function checkOut(facilityId, stayId) {
  return request(`/facility/${facilityId}/stay/${stayId}/checkout`, { method: "POST" });
}
