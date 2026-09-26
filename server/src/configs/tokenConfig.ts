import { CookieOptions } from "express"

export const REFRESH_TOKEN = {
  COOKIE_NAME: "refreshToken",
  DEFAULT_EXPIRATION_IN_DAYS: 30,

  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  } as CookieOptions,
};

export const RESET_PASS_TOKEN = {
  DEFAULT_EXPIRATION_IN_MINS: 15
}

export const REQ_RESET_PASS_TOKEN = {
  DEFAULT_EXPIRATION_IN_MINS: 15
}
