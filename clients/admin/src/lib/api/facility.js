/**
 * Facility endpoints: assigned facility, facility CRUD and facility staff
 * assignment. All calls go through the shared `request()` core — see client.js.
 */

import { request } from "./client.js";

/**
 * GET /api/v1/facility  (auth + FETCH_FACILITY)
 *
 * Role-scoped by the controller: an ADMIN gets every facility, a
 * FACILITY_STAFF gets ONLY the facility they are assigned to. The staff shape
 * is `{ facility: FacilityDTO | null }` — `null` means "not assigned".
 */
export async function getAssignedFacility() {
  const { data } = await request("/facility");
  return data.facility ?? null;
}

/* ------------------------------------------------------------------ *
 * Facilities (auth + FETCH_FACILITY / REGISTER_FACILITY /
 * EDIT_FACILITY / DELETE_FACILITY)
 * ------------------------------------------------------------------ */

/**
 * GET /api/v1/facility?status=&deleted=  (auth + FETCH_FACILITY)
 *
 * Response shape is role-dependent on the server: ADMIN gets
 * `{ facilities, count }`, FACILITY_STAFF gets `{ facility | null }`.
 * Normalised here to a flat array so callers don't branch on role.
 *
 * `deleted: true` lists soft-deleted facilities instead of active ones and is
 * ADMIN-only server-side (403 otherwise) — it feeds the restore flow.
 */
export async function listFacilities({ status, deleted = false } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (deleted) params.set("deleted", "true");
  const qs = params.toString();

  const { data } = await request(`/facility${qs ? `?${qs}` : ""}`);
  return data.facilities ?? (data.facility ? [data.facility] : []);
}

/**
 * POST /api/v1/facility  (auth + REGISTER_FACILITY, ADMIN only)
 * Body: { name, address, note?, maxCapacity, latitude, longitude }.
 * 400 when another facility already occupies the coordinates.
 * NOTE: the server echoes the request body — it does NOT return the created
 * id, so refetch the list after creating.
 */
export async function createFacility(payload) {
  return request("/facility", { method: "POST", body: payload });
}

/**
 * PATCH /api/v1/facility/:facilityId  (auth + EDIT_FACILITY; staff scoped to
 * their own facility by assertFacilityAccess). Body: any subset of
 * { name, address, note, maxCapacity, status, latitude, longitude }.
 * Response data: the persisted record.
 */
export async function patchFacility(facilityId, payload) {
  return request(`/facility/${facilityId}`, { method: "PATCH", body: payload });
}

/**
 * DELETE /api/v1/facility/:facilityId  (auth + DELETE_FACILITY, ADMIN only)
 *
 * TOGGLE semantics: deletes an active facility (soft delete) and RESTORES an
 * already-deleted one. 400 while evacuees are checked in; 400 on restore when
 * another facility took its coordinates. Response: message only.
 */
/**
 * GET /api/v1/facility (registry mode) — search + sort + pagination. Always
 * sends paging params so the server answers with the paged envelope
 * { facilities, total, page, pageSize } (the legacy listFacilities keeps the
 * bare-array contract for its other callers).
 */
export async function listFacilitiesPage({
  search,
  status,
  deleted = false,
  sort = "created",
  order = "asc",
  page = 1,
  pageSize = 10,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (status) params.set("status", status);
  params.set("deleted", String(Boolean(deleted)));
  if (sort) params.set("sort", sort);
  if (order) params.set("order", order);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  const { data } = await request(`/facility?${params.toString()}`);
  return {
    facilities: data.facilities ?? [],
    total: data.total ?? 0,
    page: data.page ?? page,
    pageSize: data.pageSize ?? pageSize,
  };
}

/** POST /api/v1/facility/bulk-toggle — bulk soft-delete / restore. */
export async function bulkToggleFacilities(ids, deleted) {
  return request("/facility/bulk-toggle", {
    method: "POST",
    body: { ids, deleted },
  });
}

export async function deleteFacility(facilityId) {
  return request(`/facility/${facilityId}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ *
 * Facility staff assignment (ASSIGN_STAFF / DISMISS_STAFF — ADMIN only;
 * the list itself is FETCH_STAFF)
 * ------------------------------------------------------------------ */

/** GET /api/v1/facility/:facilityId/staff -> { staffs, count } */
export async function listFacilityStaff(facilityId) {
  const { data } = await request(`/facility/${facilityId}/staff`);
  return data.staffs ?? [];
}

/**
 * POST /api/v1/facility/:facilityId/staff/:userId  (ASSIGN_STAFF)
 * Assigns the staff to the facility — or TRANSFERS them if they already
 * belong to another one (server behaviour; UI must confirm accordingly).
 */
export async function assignFacilityStaff(facilityId, userId) {
  return request(`/facility/${facilityId}/staff/${userId}`, { method: "POST" });
}

/** DELETE /api/v1/facility/:facilityId/staff/:userId  (DISMISS_STAFF) */
export async function dismissFacilityStaff(facilityId, userId) {
  return request(`/facility/${facilityId}/staff/${userId}`, { method: "DELETE" });
}
