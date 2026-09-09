import {Request, Response } from "express"
import crypto from "crypto"
import bcrypt from "bcryptjs"

import { BadRequestMsgError } from "../core/ApiError"
import { SuccessResponse } from "../core/ApiResponse"

import userService from "../services/user.services"
import { validateData } from "../utils/validatorUtils"
import { loginSchema, registerSchema } from "../validations/auth.validations"
import { createAccessToken } from "./../utils/jwtUtils"

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