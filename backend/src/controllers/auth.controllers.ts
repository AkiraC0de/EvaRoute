import {Request, Response } from "express"
import crypto from "crypto"
import bcrypt from "bcryptjs"

import { BadRequestMsgError } from "../core/ApiError"
import { SuccessResponse } from "../core/ApiResponse"

import userService from "../services/user.services"
import { validateData } from "../utils/validatorUtils"
import { registerSchema } from "../validations/auth.validations"


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
    "New account has been created.", 
    {
      email,
      defaultPassword
    }
  ).send(res)
}