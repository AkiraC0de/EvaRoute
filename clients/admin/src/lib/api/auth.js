/**
 * Auth endpoints: login, sign-out and the password reset / change flows.
 * All calls go through the shared `request()` core — see client.js.
 */

import { request, setAccessToken, clearAccessToken } from "./client.js";

/* ------------------------------------------------------------------ *
 * Endpoints
 * ------------------------------------------------------------------ */

/**
 * POST /api/v1/auth/login  (public)
 * Body: { email, password, keepLogin }  — all three are required by
 * `loginSchema`; `keepLogin` is NOT optional.
 * Response data: { user: { email, firstName, lastName, role, isSetupDone },
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
 * POST /api/v1/auth/signout  (auth) — drops this device's refresh token and
 * clears the cookie. The local access token is discarded ONLY after the
 * server confirms: a failed request must leave the session intact so the
 * user stays signed in and can retry (see AuthProvider.signOut).
 */
export async function signOut() {
  await request("/auth/signout", { method: "POST" });
  clearAccessToken();
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
 * Password reset (public flow — no session required)
 *
 * Server contract (server/src/routes/auth.routes.ts):
 *   1. POST /auth/password/request-reset  Body: { email }  -> { user, token }
 *      The `token` is a raw single-use token; its SHA-256 hash is stored
 *      server-side (TokenType.REQ_RESET_PASS) together with a hashed 5-digit
 *      OTP that is emailed to the user. Expires in 15 minutes.
 *   2. POST /auth/password/verify-reset  (Authorization: Bearer <token1>)
 *      Body { otp } — 5 digits, max 10 attempts.
 *      -> { token } — a NEW raw token (TokenType.RESET_PASS, 15 min expiry).
 *   3. POST /auth/password/reset  (Authorization: Bearer <token2>)
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
 * Step 1 — request a reset OTP (POST; the email travels in the body).
 * Response data: { user: { email }, token } — keep `token` for step 2.
 * 400 "Email is not registered." when the account does not exist.
 */
export async function requestPasswordReset(email) {
  const { data } = await request("/auth/password/request-reset", {
    method: "POST",
    auth: false,
    body: { email },
  });
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
 * POST /api/v1/auth/password/change  (authenticated; ADMIN + FACILITY_STAFF).
 * Body: { currentPassword, newPassword } -> message only.
 * 400 "Current password is incorrect." or details.errors (password rules).
 */
export async function changePassword(currentPassword, newPassword) {
  return request("/auth/password/change", {
    method: "POST",
    body: { currentPassword, newPassword },
  });
}

/**
 * POST /api/v1/auth/account-setup  (authenticated; ADMIN + FACILITY_STAFF).
 * Body: { firstName, lastName, newPassword } — the one-time first-run setup
 * for accounts created with only email + a system-generated password. Sets
 * the name, REPLACES the generated password (server-side strength rules),
 * and flips `isSetupDone` to true. Other devices are signed out.
 * Response data: { user: { email, firstName, lastName, role, isSetupDone } }.
 */
export async function completeAccountSetup({ firstName, lastName, newPassword }) {
  const { data } = await request("/auth/account-setup", {
    method: "POST",
    body: { firstName, lastName, newPassword },
  });
  return data.user;
}
