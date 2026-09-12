import { CookieOptions } from "express"

export const REFRESH_TOKEN = {
  DEFAULT_EXPIRATION_IN_DAYS: 30,
  COOKIE_OPTIONS:  {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  } as CookieOptions
}

export const RESET_PASS_TOKEN = {
  DEFAULT_EXPIRATION_IN_MINS: 15
}

export const REQ_RESET_PASS_TOKEN = {
  DEFAULT_EXPIRATION_IN_MINS: 15
}
