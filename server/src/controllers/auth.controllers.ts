import { passResetSchema, signOutAllSchema, verifyResetPassSchema, changePasswordSchema, accountSetupSchema } from './../validations/auth.validations.js'
import {Request, Response } from "express"
import crypto from "node:crypto"
import bcrypt from "bcryptjs"

import { BadRequestError, BadRequestMsgError, ForbiddenError, NotFoundError, UnauthorizedError } from "../core/ApiError.js"
import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse.js"
import { ActivityAction, TokenType } from "../../generated/prisma/index.js"
import { logActivity } from "../utils/activityUtils.js"

import userService from "../services/user.services.js"
import tokenService from "../services/token.services.js"
import refreshTokenService from '../services/refreshToken.services.js';

import { validateData } from "../utils/validatorUtils.js"
import { loginSchema, passReqResetSchema } from "../validations/auth.validations.js"
import { requireAuth } from "../utils/authUtils.js"
import { createAccessToken } from "./../utils/jwtUtils.js"
import { cryptoHash, generateOTP, generateCryptoToken, requireToken, cryptoHashCompare, generateCryptoTokenHash, getRefreshTokenExpirationDate } from "../utils/authUtils.js"
import { ApiMailer } from "../core/ApiMailer.js"
import tokenServices from '../services/token.services.js'
import userServices from '../services/user.services.js'
import { REFRESH_TOKEN, OTP } from '../configs/tokenConfig.js'

export const handleLogin = async (req: Request, res: Response) => {
  const userData = validateData<typeof loginSchema>(loginSchema, req.body)
  const { email, password, keepLogin } = userData

  const user = await userService.findByEmail(email)
  if(!user) {
    // One message for both failure modes: a login probe must not reveal
    // whether an email is registered.
    throw new BadRequestMsgError("Incorrect email or password.")
  }

  const passwordMatched = await bcrypt.compare(password, user.password)
  if(!passwordMatched){
    throw new BadRequestMsgError("Incorrect email or password.")
  }

  if(!user.isActive){
    throw new ForbiddenError("This account has been deactivated. Contact an administrator.")
  }

  const accessToken = createAccessToken({id: user.id, role: user.role})

  if(req.cookies[REFRESH_TOKEN.COOKIE_NAME]){
    const hashCookieRefreshToken = cryptoHash(req.cookies[REFRESH_TOKEN.COOKIE_NAME])
    
    await refreshTokenService.deleteByToken(hashCookieRefreshToken).catch(err => {})
    
    res.clearCookie(REFRESH_TOKEN.COOKIE_NAME, REFRESH_TOKEN.COOKIE_OPTIONS)
  }
  
  const [rawRefreshToken, hashRefreshToken] = generateCryptoTokenHash()
  const refreshTokenExpirationDate = getRefreshTokenExpirationDate(keepLogin)
  await refreshTokenService.create(user.id, hashRefreshToken, refreshTokenExpirationDate) 

  res.cookie(REFRESH_TOKEN.COOKIE_NAME, rawRefreshToken, {
    ...REFRESH_TOKEN.COOKIE_OPTIONS,
    expires: refreshTokenExpirationDate
  })

  await logActivity(req, ActivityAction.AUTH_LOGIN, {
    actor: {
      id: user.id,
      email: user.email,
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null,
      role: user.role
    },
    metadata: { keepLogin }
  })

  return new SuccessResponse(
    "Login success.", {
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isSetupDone: user.isSetupDone
      },
      accessToken
    }
  ).send(res)
}

export const handlePassReqReset = async (req: Request, res: Response) => {
  // POST body — the flow used to pass the email in the query string (GET),
  // which leaked it into server logs, proxies, browser history and Referers.
  const { email } = validateData<typeof passReqResetSchema>(passReqResetSchema, req.body)

  const user = await userService.findByEmail(email)
   if(!user) {
    throw new BadRequestMsgError("Email is not registered.")
  }

  const otp = generateOTP()
  const hashedOtp = cryptoHash(otp)
  const rawToken = generateCryptoToken()
  const hashToken = cryptoHash(rawToken)

  // The OTP guessing budget is per USER, not per token: minting a fresh reset
  // token is unauthenticated, so a per-token budget would let an attacker
  // brute-force the 5-digit OTP with unlimited retries. The failed-attempt
  // count carries over across tokens created inside OTP.ATTEMPT_WINDOW_MS;
  // once the window lapses the budget starts fresh (bounded lockout, not a
  // permanent one).
  const existing = await tokenService.findByUserIdType(user.id, TokenType.REQ_RESET_PASS)
  const existingPayload = (existing?.payload ?? {}) as { attempts?: number; windowStart?: number }
  const withinWindow =
    typeof existingPayload.windowStart === "number" &&
    Date.now() - existingPayload.windowStart < OTP.ATTEMPT_WINDOW_MS
  const carriedAttempts = withinWindow ? existingPayload.attempts ?? 0 : 0
  const windowStart = withinWindow ? existingPayload.windowStart : Date.now()

  // One live reset session at a time: retire any earlier request tokens so a
  // previously intercepted OTP cannot stay valid alongside the new one.
  await tokenService.deleteByUserIdType(user.id, TokenType.REQ_RESET_PASS)
  await tokenService.createReqResetPass(user.id, hashedOtp, hashToken, carriedAttempts, windowStart)
  await ApiMailer.sendOTP(email, otp, "Reset password OTP")

  await logActivity(req, ActivityAction.AUTH_PASSWORD_RESET_REQUESTED, {
    actor: {
      id: user.id,
      email: user.email,
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null,
      role: user.role
    }
  })

  return new SuccessResponse(
    "We've sent an OTP to you via email. Please check your emails inbox or spam.",
      {
        user: {
          email
        },
        token: rawToken
      }
  ).send(res)
}

export const handleVerifyResetPass = async (req: Request, res: Response) => {
  const MAX_ATTEMPT = OTP.MAX_ATTEMPTS

  const token = requireToken(req)
  const { otp } = validateData<typeof verifyResetPassSchema>(verifyResetPassSchema, req.body) 

  // @ts-ignore
  const currentAttempts = token.payload.attempts ?? 0
  const remainingAttempts = MAX_ATTEMPT - currentAttempts
  if(remainingAttempts <= 0){
    throw new BadRequestError("Too many incorrect attempts. Please wait a few minutes and request a new OTP.", { attempts: currentAttempts, remainingAttempts: 0 })
  }

  // @ts-ignore
  const otpMatched = cryptoHashCompare(otp, token.payload.otp)
  // Atomic increment — the old read-modify-write let concurrent verifies lose
  // updates and bypass the cap.
  const attemptsAfter = await tokenServices.incrementAttemptById(token.id)
   
  if(!otpMatched){
    const remainingAttemptsAfter = MAX_ATTEMPT - attemptsAfter
    if(remainingAttemptsAfter <= 0){
      throw new BadRequestError("Incorrect PIN. Too many incorrect attempts - please wait a few minutes and request a new OTP.", { attempts: attemptsAfter, remainingAttempts: 0 })
    }
    throw new BadRequestError("Incorrect PIN.", { attempts: attemptsAfter, remainingAttempts: remainingAttemptsAfter })
  }

  const newRawToken = generateCryptoToken()
  const newHashToken = cryptoHash(newRawToken)
  // Replace, don't accumulate: any earlier RESET_PASS row would otherwise stay
  // valid for its full lifetime alongside the new one. Consuming this request
  // token happens in the SAME transaction — a partial failure must not leave
  // both tokens (or neither) usable.
  await tokenServices.consumeReqResetAndCreateResetPass(token.userId, token.id, newHashToken)

  return new SuccessResponse(
    "Correct PIN. You may now reset your password.",
      {
        token: newRawToken
      }
  ).send(res)
}

export const handlePassReset = async (req: Request, res: Response) => {
  const token = requireToken(req)
  const { newPassword } = validateData<typeof passResetSchema>(passResetSchema, req.body)
  
  const hashedPassword = await bcrypt.hash(newPassword, 12)

  // Single-use + atomic: the password change, the reset-token consumption and
  // the session purge succeed together or not at all — a failed token delete
  // must never leave a live reset bearer token behind after the password has
  // already changed.
  await tokenServices.consumeResetPassAndSetPassword(token.userId, token.id, hashedPassword)

  // Public flow (no access token): the actor comes from the reset token's
  // user. Best-effort — never blocks the reset itself.
  logActivity(req, ActivityAction.AUTH_PASSWORD_RESET, {
    actor: {
      id: token.user.id,
      email: token.user.email,
      name: `${token.user.firstName ?? ""} ${token.user.lastName ?? ""}`.trim() || null,
      role: token.user.role
    }
  })

  return new SuccessMsgResponse("Your password has been changed. You have been signed out from all devices — please log in again.").send(res)
}

export const handleRefresh = async (req: Request, res: Response) => {
  if(!req.cookies[REFRESH_TOKEN.COOKIE_NAME]){
    throw new UnauthorizedError("Missing or expired token. Please proceed to login.")
  }

  const hashCookieRefreshToken = cryptoHash(req.cookies[REFRESH_TOKEN.COOKIE_NAME])
  const refreshToken = await refreshTokenService.findByToken(hashCookieRefreshToken)
  
  if(!refreshToken){
    // No clearCookie here on purpose: during a rotation race the browser may
    // legitimately hold a NEWER rotated cookie than the one sent — wiping the
    // jar would destroy that valid session. A stale cookie expires on its
    // own (see the expired branch below).
    throw new UnauthorizedError("Invalid token. Please proceed to login.") 
  }

  if(refreshToken.expiresAt.getTime() < Date.now()){
    await refreshTokenService.deleteById(refreshToken.id)
    res.clearCookie(REFRESH_TOKEN.COOKIE_NAME, REFRESH_TOKEN.COOKIE_OPTIONS)
    throw new UnauthorizedError("Expired token. Please proceed to login.") 
  }

  // Rotation grace window: a token already rotated more than
  // ROTATION_GRACE_MS ago is dead even though its row still exists (the row
  // keeps the original session horizon so grace successors inherit it — see
  // the rotation block below).
  if(refreshToken.rotatedAt && refreshToken.rotatedAt.getTime() + REFRESH_TOKEN.ROTATION_GRACE_MS < Date.now()){
    // Reuse detection: a token replayed after its grace window is a leaked
    // token being used again. Revoking only this row would leave the successor
    // chain alive — kill the user's whole refresh family instead.
    await refreshTokenService.deleteAllByUserId(refreshToken.userId)
    throw new UnauthorizedError("Invalid token. Please proceed to login.")
  }

  const user = await userService.findById(refreshToken.userId)
  if(!user) {
    throw new UnauthorizedError("User not found. Please proceed to login.")
  }

  if(!user.isActive){
    throw new ForbiddenError("This account has been deactivated. Contact an administrator.")
  }

  // Rotation with grace: mark the previous row rotated instead of deleting
  // it (grace window = REFRESH_TOKEN.ROTATION_GRACE_MS) so a concurrent
  // request already in flight with the old cookie — a second tab, or React
  // StrictMode's double-invoked effects — still succeeds instead of dying
  // mid-rotation. `expiresAt` is NOT touched: the successor inherits the
  // original session horizon (30d keep-login / 1h otherwise).
  await refreshTokenService.markRotated(refreshToken.id)

  const [newRefreshToken, newRefreshTokenHash] = generateCryptoTokenHash() 
  await refreshTokenService.create(user.id, newRefreshTokenHash, refreshToken.expiresAt)

  const accessToken = createAccessToken({ id: user.id, role: user.role })

  res.cookie(REFRESH_TOKEN.COOKIE_NAME, newRefreshToken, {
    ...REFRESH_TOKEN.COOKIE_OPTIONS,
    expires: refreshToken.expiresAt
  })

  return new SuccessResponse(
    "Refresh success.", {
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isSetupDone: user.isSetupDone
      },
      accessToken
    }
  ).send(res)
}

// Sign out user to its current device
export const handleSignOut = async (req: Request, res: Response) => {
  const { userId } = requireAuth(req)

  const cookieToken = req.cookies[REFRESH_TOKEN.COOKIE_NAME]
  if (cookieToken) {
    const refreshToken = await refreshTokenService.findByToken(cryptoHash(cookieToken))
    if (refreshToken && refreshToken.userId === userId) {
      await refreshTokenService.deleteById(refreshToken.id)
    }
  }

  res.clearCookie(REFRESH_TOKEN.COOKIE_NAME)
  await logActivity(req, ActivityAction.AUTH_SIGN_OUT)
  return new SuccessMsgResponse("Signed out complete.").send(res)
}

// Requires the account password as proof of identity (protects against a stolen
// access token being used to revoke the victim's other sessions).
export const handleSignOutAllDevices = async (req: Request, res: Response) => {
  const { userId } = requireAuth(req)
  const { password } = validateData<typeof signOutAllSchema>(signOutAllSchema, req.body)

  const user = await userService.findById(userId)
  if (!user) {
    throw new NotFoundError("User not found.")
  }

  const passwordMatched = await bcrypt.compare(password, user.password)
  if (!passwordMatched) {
    throw new BadRequestMsgError("Incorrect password.")
  }

  // Keep THIS device's session when the cookie holds one of the user's valid
  // refresh tokens; otherwise (no cookie / stale / rotated away) wipe them all.
  const cookieToken = req.cookies[REFRESH_TOKEN.COOKIE_NAME]
  if (cookieToken) {
    const refreshToken = await refreshTokenService.findByToken(cryptoHash(cookieToken))
    if (refreshToken && refreshToken.userId === userId) {
      await refreshTokenService.deleteAllByUserIdExcept(userId, refreshToken.id)
      await logActivity(req, ActivityAction.AUTH_SIGN_OUT_ALL)
      return new SuccessMsgResponse("Signed out from all other devices.").send(res)
    }
  }

  await refreshTokenService.deleteAllByUserId(userId)
  await logActivity(req, ActivityAction.AUTH_SIGN_OUT_ALL)
  return new SuccessMsgResponse("Signed out from all other devices.").send(res)
}

// First-time account setup (ADMIN + FACILITY_STAFF): staff accounts are
// created with only email + password, so the signed-in user completes their
// name here once. Flips `isSetupDone`; returns the same user shape as
// login/refresh so the client can replace its stored identity.
//
// SERVER-ENFORCED first-run only: unlike the client gate, this must not be
// reusable. The endpoint sets a new password with no proof of the old one, so
// leaving it open turns a stolen 15-minute access token into permanent account
// takeover. Every later password change goes through handleChangePassword,
// which requires the CURRENT password.
export const handleAccountSetup = async (req: Request, res: Response) => {
  const { userId } = requireAuth(req)
  const { newPassword, firstName, lastName } = validateData<typeof accountSetupSchema>(accountSetupSchema, req.body)

  const user = await userService.findById(userId)
  if (!user) {
    throw new NotFoundError("User not found.")
  }

  if (user.isSetupDone) {
    throw new BadRequestMsgError("This account has already been set up. Use password change instead.")
  }

  // Replace the system-generated password (same strength rules as
  // passResetSchema via newPasswordField, hashed like handleChangePassword).
  await userService.updatePassword(userId, await bcrypt.hash(newPassword, 12))

  // Keep THIS device's session; sign out every other device that may hold
  // the old generated password (mirrors handleChangePassword).
  const cookieToken = req.cookies[REFRESH_TOKEN.COOKIE_NAME]
  const refreshToken = cookieToken
    ? await refreshTokenService.findByToken(cryptoHash(cookieToken))
    : null
  if (refreshToken && refreshToken.userId === userId) {
    await refreshTokenService.deleteAllByUserIdExcept(userId, refreshToken.id)
  } else {
    await refreshTokenService.deleteAllByUserId(userId)
  }

  await logActivity(req, ActivityAction.AUTH_PASSWORD_RESET)

  const updatedUser = await userService.update(userId, {
    firstName,
    lastName,
    isSetupDone: true
  })

  return new SuccessResponse(
    "Account setup completed.",
    {
      user: {
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        isSetupDone: updatedUser.isSetupDone
      }
    }
  ).send(res)
}

// Change the signed-in user's password. Proves identity with the CURRENT
// password (same policy as signout-all), then revokes every OTHER session —
// this device stays signed in.
export const handleChangePassword = async (req: Request, res: Response) => {
  const { userId } = requireAuth(req)
  const { currentPassword, newPassword } = validateData<typeof changePasswordSchema>(changePasswordSchema, req.body)

  const user = await userService.findById(userId)
  if (!user) {
    throw new NotFoundError("User not found.")
  }

  const passwordMatched = await bcrypt.compare(currentPassword, user.password)
  if (!passwordMatched) {
    throw new BadRequestMsgError("Current password is incorrect.")
  }

  await userService.updatePassword(userId, await bcrypt.hash(newPassword, 12))

  // Keep THIS device's session when the cookie holds one of the user's valid
  // refresh tokens; otherwise wipe them all (mirrors handleSignOutAllDevices).
  const cookieToken = req.cookies[REFRESH_TOKEN.COOKIE_NAME]
  const refreshToken = cookieToken
    ? await refreshTokenService.findByToken(cryptoHash(cookieToken))
    : null
  if (refreshToken && refreshToken.userId === userId) {
    await refreshTokenService.deleteAllByUserIdExcept(userId, refreshToken.id)
  } else {
    await refreshTokenService.deleteAllByUserId(userId)
  }

  await logActivity(req, ActivityAction.AUTH_PASSWORD_RESET)
  return new SuccessMsgResponse("Password changed. You have been signed out of all other devices.").send(res)
}