/**
 * EvaRoute Staff (admin client) API client — core request layer.
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
 *   `Authorization: Bearer ${token}` — the token is an HS256 JWT with a
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
 * API cross-origin instead — that also works: fetch sends credentials
 * ("include") and the server echoes the origin (see the CORS note in
 * vite.config.js), so the httpOnly refresh cookie stores and travels either
 * way. Keep the mode and the server CORS in sync when changing either.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
import { toast } from "sonner";

const API_PREFIX = `${BASE_URL}/api/v1`;

// Mutation feedback (sonner): successful non-GET calls toast the server's own
// message. Auth flows stay quiet — they redirect or carry their own UI.
// Callers that batch mutations (the bulk check-out loop) pass `silent: true`
// per request so one calm summary toast replaces a stack of server messages —
// the default auto-toast behavior is unchanged for every other call.
const QUIET_TOAST_PATHS = [
  "/auth/login",
  "/auth/refresh",
  "/auth/signout",
  "/auth/signout-all",
  "/auth/password/request-reset",
  "/auth/password/verify-reset",
  "/auth/password/reset",
];
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

export async function request(path, { method = "GET", body, auth = true, token = null, isRetry = false, silent = false } = {}) {
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
      // "include" so the httpOnly refresh cookie travels in BOTH supported
      // topologies: same-origin via the dev proxy and cross-origin via
      // VITE_API_BASE_URL (the server echoes the origin — see index.ts CORS).
      credentials: "include",
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
    // Session-token failure: mint a new access token from the httpOnly
    // refresh cookie and replay the request ONCE before ending the session —
    // this is what keeps a tab alive past the 15-minute access token. A
    // rejected reset token (auth: false + custom token) must never sign the
    // user out.
    if (response.status === 401 && auth && !token) {
      if (!isRetry) {
        try {
          await refreshAccessToken();
          // Forward `silent` like every other option: a bulk-loop POST that
          // survives via this replay must stay quiet, or the retry path would
          // re-enable the per-request success toast the caller opted out of.
          return request(path, { method, body, auth, token, isRetry: true, silent });
        } catch {
          // Refresh cookie missing/expired — the session is genuinely over.
        }
      }
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

  if (
    method !== "GET" &&
    !silent &&
    !QUIET_TOAST_PATHS.some((quiet) => path.startsWith(quiet)) &&
    payload?.message
  ) {
    toast.success(payload.message);
  }

  return payload;
}

/* ------------------------------------------------------------------ *
 * Session refresh
 * ------------------------------------------------------------------ */

/**
 * POST /api/v1/auth/refresh  (public route, authenticated by the httpOnly
 * refresh cookie) -> rotates the refresh token and mints a new access token.
 */
export async function refreshSession() {
  const { data } = await request("/auth/refresh", { method: "POST", auth: false });
  setAccessToken(data.accessToken);
  return data.user;
}

/**
 * Single-flight refresh used by BOTH the 401-retry path and the boot
 * restore: concurrent callers (React StrictMode double-invoked effects,
 * parallel requests hitting an expired access token) share one
 * /auth/refresh call — the server rotates the refresh token on every call,
 * so uncoordinated parallel refreshes would race each other's cookies.
 */
let refreshInFlight = null;

export function refreshAccessToken() {
  if (!refreshInFlight) {
    refreshInFlight = refreshSession().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}
