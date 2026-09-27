import { z } from "zod"

export const listStaffQuerySchema = z.object({
  unassigned: z.coerce.boolean().optional(),
  facilityId: z.string().uuid().optional(),
  search: z.string().trim().min(1).max(100).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
})

export type ListStaffQuery = z.infer<typeof listStaffQuerySchema>

export const patchStaffSchema = z.object({
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(50).optional(),
})

export type PatchStaffBody = z.infer<typeof patchStaffSchema>


export const registerSchema = z
  .object({
    email: z
      .string("Email is required.")
      .min(1, "Email is required.")
      .email("Please provide a valid email address.")
      .toLowerCase()
      .trim(),
  })