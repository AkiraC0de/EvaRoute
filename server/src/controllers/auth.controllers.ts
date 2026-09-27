import { passResetSchema, signOutAllSchema, verifyResetPassSchema } from './../validations/auth.validations'
import {Request, Response } from "express"
import crypto from "crypto"
import bcrypt from "bcryptjs"

import { BadRequestError, BadRequestMsgError, ForbiddenError, NotFoundError, UnauthorizedError } from "../core/ApiError"
import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse"

import userService from "../services/user.services"
import tokenService from "../services/token.services"
import refreshTokenService from '../services/refreshToken.services';

import { validateData } from "../utils/validatorUtils"
import { loginSchema, passReqResetSchema } from "../validations/auth.validations"
import { requireAuth } from "../utils/authUtils"
import { createAccessToken } from "./../utils/jwtUtils"
import { cryptoHash, generateOTP, generateCryptoToken, requireToken, cryptoHashCompare, generateCryptoTokenHash, getRefeshTokenExpirationDate } from "../utils/authUtils"
import { ApiMailer } from "../core/ApiMailer"
import tokenServices from '../services/token.services'
import userServices from '../services/user.services'
import { REFRESH_TOKEN, OTP } from '../configs/tokenConfig'

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
  return new SuccessResponse(
    "Login success.", {
      user: {
        email: user.email,
        firstname: user.firstName,
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

  return new SuccessMsgResponse("Your password has been changed. You have been signed out from all devices — please log in again.").send(res)
}

export const handleRefresh = async (req: Request, res: Response) => {
  if(!req.cookies[REFRESH_TOKEN.COOKIE_NAME]){
    throw new UnauthorizedError("Missing or expired token. Please proceed to login.")
  }

  const hashCookieRefreshToken = cryptoHash(req.cookies[REFRESH_TOKEN.COOKIE_NAME])
  const refreshToken = await refreshTokenService.findByToken(hashCookieRefreshToken)
  
  if(!refreshToken){
    res.clearCookie(REFRESH_TOKEN.COOKIE_NAME, REFRESH_TOKEN.COOKIE_OPTIONS)
    throw new UnauthorizedError("Invalid token. Please proceed to login.") 
  }

  if(refreshToken.expiresAt.getTime() < Date.now()){
    await refreshTokenService.deleteById(refreshToken.id)
    res.clearCookie(REFRESH_TOKEN.COOKIE_NAME, REFRESH_TOKEN.COOKIE_OPTIONS)
    throw new UnauthorizedError("Expired token. Please proceed to login.") 
  }

  const user = await userService.findById(refreshToken.userId)
  if(!user) {
    throw new UnauthorizedError("User not found. Please proceed to login.")
  }

  if(!user.isActive){
    throw new ForbiddenError("This account has been deactivated. Contact an administrator.")
  }

  // Invalidate the previous token and keep its original expiry (rotation must not extend the session)
  await refreshTokenService.deleteById(refreshToken.id)

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
        firstname: user.firstName,
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
      return new SuccessMsgResponse("Signed out from all other devices.").send(res)
    }
  }

  await refreshTokenService.deleteAllByUserId(userId)
  return new SuccessMsgResponse("Signed out from all other devices.").send(res)
}