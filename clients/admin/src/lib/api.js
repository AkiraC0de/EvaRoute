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

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
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
    if (response.status === 401 && auth) {
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
