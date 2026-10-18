/**
 * Facility resource endpoints (CRUD). All calls go through the shared
 * `request()` core — see client.js.
 */

import { request } from "./client.js";

/**
 * GET /api/v1/facility/:facilityId/resource  (auth + FETCH_RESOURCE)
 * Response data: { resources: Resource[], count }
 * Caller must be a member of the facility (assertFacilityAccess).
 */
export async function listResources(facilityId) {
  const { data } = await request(`/facility/${facilityId}/resource`);
  return data.resources ?? [];
}

/**
 * POST /api/v1/facility/:facilityId/resource  (auth + EDIT_RESOURCE)
 * Body: { name, type: "QUANTITY"|"BOOLEAN", isAvailable?, availableValue?, maxValue? }
 * QUANTITY requires availableValue + maxValue and rejects isAvailable;
 * BOOLEAN requires isAvailable and rejects availableValue/maxValue.
 * Response data: { resource }
 */
export async function createResource(facilityId, payload) {
  const { data } = await request(`/facility/${facilityId}/resource`, {
    method: "POST",
    body: payload,
  });
  return data.resource;
}

/**
 * PATCH /api/v1/facility/:facilityId/resource/:resourceId  (auth + EDIT_RESOURCE)
 * Body: any subset of { name, type, isAvailable, availableValue, maxValue }.
 * The server also rejects availableValue > maxValue.
 * Response data: { resource } — the persisted record.
 */
export async function updateResource(facilityId, resourceId, payload) {
  const { data } = await request(
    `/facility/${facilityId}/resource/${resourceId}`,
    { method: "PATCH", body: payload },
  );
  return data.resource;
}

/**
 * DELETE /api/v1/facility/:facilityId/resource/:resourceId
 * (auth + EDIT_RESOURCE). Hard delete of the resource row.
 * Response: message only.
 */
export async function deleteResource(facilityId, resourceId) {
  return request(`/facility/${facilityId}/resource/${resourceId}`, {
    method: "DELETE",
  });
}
