import { z } from "zod";

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
      .boolean("keepLogin is required.") 
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

export const signOutAllSchema = z.object({
  password: z
    .string("Password is required.")
    .min(1, "Password is required."),
})

const newPasswordField = z
    .string("Password is required.")
    .trim()
    .min(8, "Password must be at least 8 characters long.")
    .max(100, "Password cannot exceed 100 characters.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    );

export const passResetSchema = z.object({
  newPassword: newPasswordField,
})

// Authenticated self-service change: proof of identity with the CURRENT
// password (the signout-all precedent) + the shared strength rules.
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string("Password is required.")
      .min(1, "Password is required."),
    newPassword: newPasswordField,
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from the current one.",
    path: ["newPassword"],
  })