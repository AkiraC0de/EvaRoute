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