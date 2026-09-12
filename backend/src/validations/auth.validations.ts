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
      .trim(),
    keepLogin: z 
      .boolean()
      .default(false)  
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

export const passResetSchema = z.object({
  newPassword: z
      .string("Password is required.")
      .trim()
      .min(8, "Password must be at least 8 characters long.")
      .max(100, "Password cannot exceed 100 characters.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      ),
})