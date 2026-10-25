import express from "express"

import { TokenType, UserRole } from "../../generated/prisma/index.js"

import {
  handleLogin,
  handlePassReqReset,
  handlePassReset,
  handleChangePassword,
  handleAccountSetup,
  handleVerifyResetPass,
  handleRefresh,
  handleSignOutAllDevices,
  handleSignOut,
} from "../controllers/auth.controllers.js"

import verifyToken from "../middlewares/verifyToken.js"
import verifyAuthentication from "../middlewares/verifyAuthentication.js"
import rateLimit from "../middlewares/rateLimit.js"

const authRoute = express.Router()

// Anti-brute-force / anti-automation guards (in-memory per instance). The
// credential paths had NO rate limiting before — login passwords and reset
// OTPs were guessable at network speed.
const loginLimiter = rateLimit({
  scope: "auth:login",
  windowMs: 1 * 60_000,
  max: 10,
  keyFn: (req) => (typeof req.body?.email === "string" ? req.body.email : null),
  message: "Too many login attempts. Please try again in a few minutes."
})
const resetRequestLimiter = rateLimit({
  scope: "auth:reset-request",
  windowMs: 15 * 60_000,
  max: 5,
  keyFn: (req) => (typeof req.body?.email === "string" ? req.body.email : null),
  message: "Too many password reset requests. Please try again in a few minutes."
})
const resetVerifyLimiter = rateLimit({
  scope: "auth:reset-verify",
  windowMs: 5 * 60_000,
  max: 30,
  message: "Too many attempts. Please try again in a few minutes."
})
const refreshLimiter = rateLimit({ scope: "auth:refresh", windowMs: 60_000, max: 60 })

authRoute.post("/login", loginLimiter, handleLogin)

authRoute.post("/password/request-reset", resetRequestLimiter, handlePassReqReset)

// Deprecated GET shim (AUTH-07): this flow used to run over GET with the email
// in the query string. GET must never mutate again — it only explains the move.
authRoute.get("/password/request-reset", (req, res) => {
  res.status(405).json({
    message: "Use POST /auth/password/request-reset with { email } in the body."
  })
})

authRoute.post("/password/verify-reset", resetVerifyLimiter, verifyToken(TokenType.REQ_RESET_PASS), handleVerifyResetPass) 
 
authRoute.post("/password/reset", resetVerifyLimiter, verifyToken(TokenType.RESET_PASS), handlePassReset)

// Change the signed-in user's password (ADMIN + FACILITY_STAFF)
authRoute.post("/password/change", verifyAuthentication, handleChangePassword)

// First-time account setup — completes the user's name (ADMIN + FACILITY_STAFF)
authRoute.post("/account-setup", verifyAuthentication, handleAccountSetup)

// Token rotation on POST only (AUTH-07): a GET that mints new session tokens
// is cacheable, prefetchable and leaks into logs — it must never mutate.
authRoute.post("/refresh", refreshLimiter, handleRefresh)
authRoute.get("/refresh", (req, res) => {
  res.status(405).json({
    message: "Use POST /auth/refresh."
  })
})

// Sign out to its current device
authRoute.post("/signout", verifyAuthentication, handleSignOut)

// Sign out of all other devices (keeps the calling device signed in)
authRoute.post("/signout-all", verifyAuthentication, handleSignOutAllDevices)

export default authRoute