/**
 * EvaRoute Staff (admin client) API client.
 *
 * Every call here targets a route that ALREADY EXISTS in
 * `server/src/routes/*` — nothing in this file invents an endpoint. The
 * contracts were read from the route, middleware, controller, validation and
 * service layers before being written down here.
 *
 * Response envelope (server/src/core/ApiResponse.ts -> SuccessResponse):
 *   success -> { message: string, data: <payload> }
 *   failure -> { message: string, data?: <details> }
 * `statusCode` is stripped by ApiResponse.sanitize() before it reaches the wire,
 * so the HTTP status is the only place the status lives.
 *
 * Auth (server/src/middlewares/verifyAuthentication.ts):
 *   `Authorization: Bearer <accessToken>`; the token is an HS256 JWT with a
 *   15 minute lifetime (server/src/configs/tokenConfig.ts -> ACCESS_TOKEN).
 *   Refresh uses an httpOnly cookie, which only works same-origin — see
 *   vite.config.js for the dev proxy that makes that true.
 *
 * Errors thrown from the API layer are always `ApiError`, so callers can
 * branch on `err.status` (0 = never reached the server, 400 = validation /
 * bad credentials, 401 = missing or expired token, 403 = role not permitted,
 * 404 = missing record).
 */

/// <reference types="vite/client" />

/**
 * Base URL of the EvaRoute API.
 *
 * Empty (the default) means "same origin", which is what the Vite dev proxy in
 * vite.config.js serves. Setting VITE_API_BASE_URL to an absolute URL calls the
 * API cross-origin instead — that works, but the httpOnly refresh cookie is
 * then dropped by the browser (see the CORS note in vite.config.js).
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const API_PREFIX = `${BASE_URL}/api/v1`;
const TOKEN_STORAGE_KEY = "evaroute.admin.accessToken";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/* ------------------------------------------------------------------ *
 * Access token
 * ------------------------------------------------------------------ */

function readStoredToken() {
  try {
    return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode / blocked cookies): the token
    // then lives in memory for the lifetime of the tab only.
    return null;
  }
}

let accessToken = readStoredToken();
let unauthorizedHandler = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
  try {
    if (token) window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    else window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore: memory-only session is an acceptable degradation.
  }
}

export function clearAccessToken() {
  setAccessToken(null);
}

/**
 * Register a callback fired whenever an authenticated request comes back 401,
 * so the UI can drop the session instead of showing a stale screen.
 */
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

/* ------------------------------------------------------------------ *
 * Core request
 * ------------------------------------------------------------------ */

async function request(path, { method = "GET", body, auth = true, token = null } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (token) {
    // Caller-supplied bearer token (the password-reset flow passes its own
    // single-use tokens here — see requestPasswordReset/verifyResetOtp).
    headers.Authorization = `Bearer ${token}`;
  } else if (auth) {
    if (!accessToken) throw new ApiError("You are not signed in.", 401);
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response;
  try {
    response = await fetch(`${API_PREFIX}${path}`, {
      method,
      headers,
      credentials: "same-origin",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Cannot reach the EvaRoute API. Check that the backend is running.",
      0,
    );
  }

  const raw = await response.text();
  let payload = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      // Non-JSON body (e.g. the dev proxy reporting ECONNREFUSED).
      payload = null;
    }
  }

  if (!response.ok) {
    // Only a session-token failure ends the session — a rejected reset token
    // (auth: false + custom token) must not sign the user out.
    if (response.status === 401 && auth && !token) {
      clearAccessToken();
      if (unauthorizedHandler) unauthorizedHandler();
    }

    let message = payload?.message;
    if (!message) {
      message =
        response.status >= 500
          ? "The EvaRoute API returned a server error."
          : `Request failed with status ${response.status}.`;
    }

    throw new ApiError(message, response.status, payload?.data);
  }

  if (payload === null || typeof payload !== "object") {
    throw new ApiError(
      "The API returned a response this app cannot read.",
      response.status,
    );
  }

  return payload;
}

/* ------------------------------------------------------------------ *
 * Endpoints
 * ------------------------------------------------------------------ */

/**
 * POST /api/v1/auth/login  (public)
 * Body: { email, password, keepLogin }  — all three are required by
 * `loginSchema`; `keepLogin` is NOT optional.
 * Response data: { user: { email, firstname, lastName, role, isSetupDone },
 *                  accessToken }
 */
export async function login({ email, password, keepLogin }) {
  const { data } = await request("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password, keepLogin },
  });

  setAccessToken(data.accessToken);
  return data.user;
}

/**
 * GET /api/v1/auth/refresh  (public route, authenticated by the httpOnly
 * refresh cookie) -> rotates the refresh token and mints a new access token.
 */
export async function refreshSession() {
  const { data } = await request("/auth/refresh", { auth: false });
  setAccessToken(data.accessToken);
  return data.user;
}

/* ------------------------------------------------------------------ *
 * Password reset (public flow — no session required)
 *
 * Server contract (server/src/routes/auth.routes.ts):
 *   1. GET  /auth/password/request-reset?email=...   -> { user, token }
 *      The `token` is a raw single-use token; its SHA-256 hash is stored
 *      server-side (TokenType.REQ_RESET_PASS) together with a hashed 5-digit
 *      OTP that is emailed to the user. Expires in 15 minutes.
 *   2. POST /auth/password/verify-reset  (Authorization: Bearer <token 1>)
 *      Body { otp } — 5 digits, max 10 attempts.
 *      -> { token } — a NEW raw token (TokenType.RESET_PASS, 15 min expiry).
 *   3. POST /auth/password/reset  (Authorization: Bearer <token 2>)
 *      Body { newPassword } — min 8 chars, upper + lower + digit + special
 *      (@$!%*?&). Resets the password and revokes every refresh token, so the
 *      user is signed out from all devices.
 *
 * Both verify-reset and reset are guarded by `verifyToken(<type>)`
 * (server/src/middlewares/verifyToken.ts), which reads the token from the
 * Authorization header — hence the custom `token` option on request().
 * A401 from these calls means the token is invalid or expired and the flow
 * must restart at step 1.
 */

/**
 * Step 1 — request a reset OTP.
 * Response data: { user: { email }, token } — keep `token` for step 2.
 * 400 "Email is not registered." when the account does not exist.
 */
export async function requestPasswordReset(email) {
  const { data } = await request(
    `/auth/password/request-reset?email=${encodeURIComponent(email)}`,
    { auth: false },
  );
  return data;
}

/**
 * Step 2 — verify the emailed OTP.
 * Pass the raw token from step 1 as the bearer; body is the 5-digit OTP.
 * Response data: { token } — keep for step 3.
 * 400 carries `details: { attempts, remainingAttempts }` so the UI can show
 * the remaining tries; a 401 means the token itself is dead (restart at 1).
 */
export async function verifyResetOtp(resetToken, otp) {
  const { data } = await request("/auth/password/verify-reset", {
    method: "POST",
    auth: false,
    token: resetToken,
    body: { otp },
  });
  return data;
}

/**
 * Step 3 — set the new password with the token from step 2.
 * Response: message only ("...signed out from all devices...").
 * 400 carries `details.errors` (field-level password rule violations).
 */
export async function resetPassword(resetToken, newPassword) {
  return request("/auth/password/reset", {
    method: "POST",
    auth: false,
    token: resetToken,
    body: { newPassword },
  });
}

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

/**
 * POST /api/v1/auth/signout  (auth) — drops this device's refresh token and
 * clears the cookie. The access token is discarded locally either way.
 */
export async function signOut() {
  try {
    await request("/auth/signout", { method: "POST" });
  } finally {
    clearAccessToken();
  }
}

/**
 * POST /api/v1/auth/signout-all  (auth)
 * Body: { password } — the server deliberately requires the account password
 * as proof of identity. Keeps the calling device signed in.
 */
export async function signOutAllDevices(password) {
  return request("/auth/signout-all", { method: "POST", body: { password } });
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

/** POST /api/v1/facility/:facilityId/stay/:stayId/checkout  (CHECK_OUT) */
export async function checkOut(facilityId, stayId) {
  return request(`/facility/${facilityId}/stay/${stayId}/checkout`, { method: "POST" });
}
