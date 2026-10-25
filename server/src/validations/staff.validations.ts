import { z } from "zod"

export const registerSchema = z
  .object({
    email: z
      .string("Email is required.")
      .min(1, "Email is required.")
      .email("Please provide a valid email address.")
      .toLowerCase()
      .trim(),
  })

export const listStaffQuerySchema = z.object({
  // Query booleans arrive as strings — `z.coerce.boolean()` would turn "false"
  // into true (Boolean("false")). Parse explicitly; absent means no filter.
  unassigned: z
    .enum(["true", "false", "1", "0"], "unassigned must be either true or false.")
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true" || value === "1")),
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
