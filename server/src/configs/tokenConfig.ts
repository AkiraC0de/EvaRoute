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
    secure: process.env.NODE_ENV === "production" || process.env.COOKIE_SAMESITE === "none",
    sameSite: (process.env.COOKIE_SAMESITE as "strict" | "lax" | "none") ?? "strict",
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
  MAX_ATTEMPTS: 10,
  ATTEMPT_WINDOW_MS: 15 * 60_000
}

export const DEFAULT_PASSWORD_LENGTH = 8
