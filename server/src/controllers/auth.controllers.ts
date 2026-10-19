import { passResetSchema, signOutAllSchema, verifyResetPassSchema, changePasswordSchema, accountSetupSchema } from './../validations/auth.validations.js'
import {Request, Response } from "express"
import crypto from "crypto"
import bcrypt from "bcryptjs"

import { BadRequestError, BadRequestMsgError, ForbiddenError, NotFoundError, UnauthorizedError } from "../core/ApiError.js"
import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse.js"
import { ActivityAction } from "../../generated/prisma/index.js"
import { logActivity } from "../utils/activityUtils.js"

import userService from "../services/user.services.js"
import tokenService from "../services/token.services.js"
import refreshTokenService from '../services/refreshToken.services.js';

import { validateData } from "../utils/validatorUtils.js"
import { loginSchema, passReqResetSchema } from "../validations/auth.validations.js"
import { requireAuth } from "../utils/authUtils.js"
import { createAccessToken } from "./../utils/jwtUtils.js"
import { cryptoHash, generateOTP, generateCryptoToken, requireToken, cryptoHashCompare, generateCryptoTokenHash, getRefeshTokenExpirationDate } from "../utils/authUtils.js"
import { ApiMailer } from "../core/ApiMailer.js"
import tokenServices from '../services/token.services.js'
import userServices from '../services/user.services.js'
import { REFRESH_TOKEN, OTP } from '../configs/tokenConfig.js'

export const handleLogin = async (req: Request, res: Response) => {
  const userData = validateData<typeof loginSchema>(loginSchema, req.body)
  const { email, password, keepLogin } = userData

  const user = await userService.findByEmail(email)
  if(!user) {
    throw new BadRequestMsgError("Email is not registered.")
  }

  const passwordMatched = await bcrypt.compare(password, user.password)
  if(!passwordMatched){
    throw new BadRequestMsgError("Incorrect password.")
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
  const refreshTokenExpirationDate = getRefeshTokenExpirationDate(keepLogin)
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
  const { email } = validateData<typeof passReqResetSchema>(passReqResetSchema, req.query, "query") 

  const user = await userService.findByEmail(email)
   if(!user) {
    throw new BadRequestMsgError("Email is not registered.")
  }

  const otp = generateOTP()
  const hashedOtp = cryptoHash(otp)
  const rawToken = generateCryptoToken()
  const hashToken = cryptoHash(rawToken)

  await tokenService.createReqResetPass(user.id, hashedOtp, hashToken)
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
  const remainingAttempts = MAX_ATTEMPT - token.payload.attempts
  if(!remainingAttempts){
    throw new BadRequestError("You have reached the attempts limit. Please request for resend.", { attempts: MAX_ATTEMPT, remainingAttempts })
  }

  // @ts-ignore
  const otpMatched = cryptoHashCompare(otp, token.payload.otp)
  await tokenServices.incrementAttemptById(token.id)
   
  if(!otpMatched){
    // @ts-ignore
    const currentAttempts = token.payload.attempts + 1
    const remainingAttempts = MAX_ATTEMPT - currentAttempts
    if(!remainingAttempts){
      throw new BadRequestError("Incorrect PIN. You have reached the attempts limit. Please request for resend.", { attempts: currentAttempts, remainingAttempts })
    }
    throw new BadRequestError("Incorrect PIN.", { attempts: currentAttempts, remainingAttempts })
  }

  const newRawToken = generateCryptoToken()
  const newHashToken = cryptoHash(newRawToken)
  await tokenServices.createResetPass(token.userId, newHashToken)

  // Invoke the token for requesting a reset password
  await tokenService.deleteById(token.id)

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

  await userServices.updatePassword(token.userId, hashedPassword)
  await refreshTokenService.deleteAllByUserId(token.userId)

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
    await refreshTokenService.deleteById(refreshToken.id)
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
export const handleAccountSetup = async (req: Request, res: Response) => {
  const { userId } = requireAuth(req)
  const { firstName, lastName } = validateData<typeof accountSetupSchema>(accountSetupSchema, req.body)

  const user = await userService.findById(userId)
  if (!user) {
    throw new NotFoundError("User not found.")
  }

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