import { z } from "zod";

export const registerSchema = z
  .object({
    email: z
      .string("Email is required.")
      .min(1, "Email is required.")
      .email("Please provide a valid email address.")
      .toLowerCase()
      .trim(),
  })

export const loginSchema = z
  .object({
    email: z
      .string("Email is required.")
      .min(1, "Email is required.")
      .email("Please provide a valid email address.")
      .toLowerCase()
      .trim(),
    password: z
      .string("Password is required.")
      .trim()  
  })

export const passReqResetSchema = z
  .object({
    email: z
      .string("Email is required.")
      .min(1, "Email is required.")
      .email("Please provide a valid email address.")
      .toLowerCase()
      .trim(),
  })

export const verifyResetPassSchema = z.object({
  otp: z
    .string("OTP is required.")
    .trim()
    .length(5, "OTP must be exactly 5 digits.")
    .regex(/^\d+$/, "OTP must contain only digits."),
})