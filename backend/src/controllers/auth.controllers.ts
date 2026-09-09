import {Request, Response } from "express"
import crypto from "crypto"
import bcrypt from "bcryptjs"

import { BadRequestMsgError } from "../core/ApiError"
import { SuccessResponse } from "../core/ApiResponse"

import userService from "../services/user.services"
import tokenService from "../services/token.services"

import { validateData } from "../utils/validatorUtils"
import { loginSchema, registerSchema, passReqResetSchema } from "../validations/auth.validations"
import { createAccessToken } from "./../utils/jwtUtils"
import { cryptoHash, generateOTP, generateCrytoToken } from "../utils/authUtils"
import { ApiMailer } from "../core/ApiMailer"

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

  new SuccessResponse(
    "New account has been created.", {
      email,
      defaultPassword
    }
  ).send(res)
}

export const handleLogin = async (req: Request, res: Response) => {
  const userData = validateData<typeof loginSchema>(loginSchema, req.body)
  const { email, password } = userData

  const user = await userService.findByEmail(email)
  if(!user) {
    throw new BadRequestMsgError("Email is not registered.")
  }

  const passwordMatched = await bcrypt.compare(password, user.password)
  if(!passwordMatched){
    throw new BadRequestMsgError("Incorrect password.")
  }

  const accessToken = createAccessToken(user)

  new SuccessResponse(
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
  const { email } = validateData<typeof passReqResetSchema>(passReqResetSchema, req.body) 

  const user = await userService.findByEmail(email)
   if(!user) {
    throw new BadRequestMsgError("Email is not registered.")
  }

  const otp = generateOTP()
  const hashedOtp = cryptoHash(otp)
  const passReqToken = generateCrytoToken()

  const token = await tokenService.createEmailVerify(user.id, hashedOtp, )

  await ApiMailer.sendOTP(email, otp, "Reset password OTP")

  new SuccessResponse(
    "We've sent an OTP to you via email. Please check your emails inbox or spam.",
      {
        user: {
          email
        },
        token: token.id
      }
  ).send(res)
}

export const handlePassReset = async (req: Request, res: Response) => {
  
}