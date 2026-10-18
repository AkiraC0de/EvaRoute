/**
 * Staff account endpoints. All calls go through the shared `request()` core —
 * see client.js.
 */

import { request } from "./client.js";

/* ------------------------------------------------------------------ *
 * Staff accounts (auth + FETCH_ALL_STAFF / REGISTER_STAFF_ACC /
 * EDIT_STAFF_ACC / DELETE_STAFF_ACC — all ADMIN only; every endpoint
 * refuses non-FACILITY_STAFF targets)
 * ------------------------------------------------------------------ */

/**
 * GET /api/v1/staff?search=&status=&unassigned=&facilityId=
 * Server-side filters: `search` matches email/first/last name (insensitive),
 * `status` is ACTIVE|INACTIVE, `unassigned=true` only staff with no facility,
 * `facilityId` only staff of one facility. Returns { staffs, count }
 * (createdAt ascending, no pagination).
 */
export async function listStaffAccounts(query = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.unassigned) params.set("unassigned", "true");
  if (query.facilityId) params.set("facilityId", query.facilityId);
  const qs = params.toString();

  const { data } = await request(`/staff${qs ? `?${qs}` : ""}`);
  return { staffs: data.staffs ?? [], count: data.count ?? 0 };
}

/** GET /api/v1/staff/:userId -> { staff } */
export async function getStaffAccount(userId) {
  const { data } = await request(`/staff/${userId}`);
  return data.staff;
}

/**
 * POST /api/v1/staff  (REGISTER_STAFF_ACC)
 * Body: { email }. The server generates a default password and EMAILS it;
 * the response also carries it once: { email, defaultPassword }.
 */
export async function createStaffAccount(email) {
  const { data } = await request("/staff", { method: "POST", body: { email } });
  return data;
}

/**
 * PATCH /api/v1/staff/:userId  (EDIT_STAFF_ACC)
 * Body: any subset of { firstName, lastName } — the only editable fields.
 */
export async function patchStaffAccount(userId, payload) {
  const { data } = await request(`/staff/${userId}`, { method: "PATCH", body: payload });
  return data.staff;
}

/** POST /api/v1/staff/:userId/activate  (EDIT_STAFF_ACC) */
export async function activateStaffAccount(userId) {
  return request(`/staff/${userId}/activate`, { method: "POST" });
}

/**
 * POST /api/v1/staff/:userId/deactivate  (EDIT_STAFF_ACC)
 * Revokes the account's sessions. 400 when targeting yourself.
 */
export async function deactivateStaffAccount(userId) {
  return request(`/staff/${userId}/deactivate`, { method: "POST" });
}

/**
 * POST /api/v1/staff/:userId/reset-password  (EDIT_STAFF_ACC)
 * Generates + emails a new default password and revokes sessions; also
 * reactivates an inactive account. Response: { defaultPassword } (once).
 */
export async function resetStaffPassword(userId) {
  const { data } = await request(`/staff/${userId}/reset-password`, { method: "POST" });
  return data;
}

/**
 * DELETE /api/v1/staff/:userId  (DELETE_STAFF_ACC)
 * Permanent delete. 400 when targeting yourself.
 */
export async function deleteStaffAccount(userId) {
  return request(`/staff/${userId}`, { method: "DELETE" });
}
