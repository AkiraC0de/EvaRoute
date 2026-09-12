import { passResetSchema, verifyResetPassSchema } from './../validations/auth.validations'
import {Request, Response } from "express"
import crypto from "crypto"
import bcrypt from "bcryptjs"

import { BadRequestError, BadRequestMsgError } from "../core/ApiError"
import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse"

import userService from "../services/user.services"
import tokenService from "../services/token.services"
import refreshTokenService from '../services/refreshToken.services';

import { validateData } from "../utils/validatorUtils"
import { loginSchema, registerSchema, passReqResetSchema } from "../validations/auth.validations"
import { createAccessToken } from "./../utils/jwtUtils"
import { cryptoHash, generateOTP, generateCryptoToken, requireAuth, requireToken, cryptoHashCompare, generateCryptoTokenHash } from "../utils/authUtils"
import { ApiMailer } from "../core/ApiMailer"
import tokenServices from '../services/token.services'
import userServices from '../services/user.services'
import { REFRESH_TOKEN } from '../configs/tokenConfig'

export const handleRegister = async (req: Request, res: Response) => {
  const userData = validateData<typeof registerSchema>(registerSchema, req.body)
  const { email } = userData

  const existingUser = await userService.findByEmail(email)
  if(existingUser){
    throw new BadRequestMsgError("This email address is already registered.")
  }

  const defaultPassword = crypto.randomBytes(8).toString('hex')
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  await userService.create({
    email,
    password: hashedPassword,
  })

  return new SuccessResponse(
    "New account has been created.", {
      email,
      defaultPassword
    }
  ).send(res)
}

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

  const accessToken = createAccessToken(user)
  const [rawRefreshToken, hashRefreshToken] = generateCryptoTokenHash()

  const refreshTokenExpirationDate = new Date()

  if (!keepLogin) {
    refreshTokenExpirationDate.setHours(1)
  } else {
    refreshTokenExpirationDate.setDate(
      refreshTokenExpirationDate.getDate() + REFRESH_TOKEN.DEFAULT_EXPIRATION_IN_DAYS
    )
  }

  const refreshToken = await refreshTokenService.create(user.id, hashRefreshToken, refreshTokenExpirationDate) 

  res.cookie("refreshToken", rawRefreshToken, {
    ...REFRESH_TOKEN.COOKIE_OPTIONS,
    expires: refreshTokenExpirationDate,
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
  const MAX_ATTEMPT = 10

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
  
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await userServices.updatePassword(token.userId, hashedPassword)

  return new SuccessMsgResponse("Your password has changed. You may now login with your new password").send(res)
}