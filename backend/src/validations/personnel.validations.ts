import { z } from "zod"

export const createPersonnelSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
})