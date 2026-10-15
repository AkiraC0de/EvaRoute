import { CookieOptions } from "express"

export const REFRESH_TOKEN = {
  COOKIE_NAME: "refreshToken",
  DEFAULT_EXPIRATION_IN_DAYS: 30,

  // Rotation grace: when a refresh rotates the token, the old row survives
  // for this long (bounded by its original expiry) instead of being deleted.
  // A request already in flight with the old cookie — a second browser tab,
  // or React StrictMode's double-invoked effects — then still validates
  // instead of destroying the session mid-rotation. 60s is the standard
  // replay-window tradeoff for rotating refresh tokens.
  ROTATION_GRACE_MS: 60_000,

  COOKIE_OPTIONS: {
    httpOnly: true,
    // Browsers require `Secure` whenever sameSite is "none" (cross-site
    // deployments) and in production; plain-http dev stays loose.
    secure: process.env.NODE_ENV === "production" || process.env.COOKIE_SAMESITE === "none",
    // "strict" by default — localhost:5173 -> localhost:3000 is same-site
    // (same host, different port), so it works there. Set
    // COOKIE_SAMESITE=lax|none for other topologies (none needs HTTPS).
    sameSite: (process.env.COOKIE_SAMESITE as "strict" | "lax" | "none") ?? "strict",
    // NOTE: no `maxAge` here — each login/refresh sets an explicit `expires`
    // matching the token's DB expiry, so the cookie never outlives the session.
  } as CookieOptions,
};

export const RESET_PASS_TOKEN = {
  DEFAULT_EXPIRATION_IN_MINS: 15
}

export const REQ_RESET_PASS_TOKEN = {
  DEFAULT_EXPIRATION_IN_MINS: 15
}

export const ACCESS_TOKEN = {
  EXPIRATION: "15m"
} as const

export const OTP = {
  MAX_ATTEMPTS: 10
}

export const DEFAULT_PASSWORD_LENGTH = 8
