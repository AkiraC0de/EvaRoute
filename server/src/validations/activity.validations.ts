import { z } from "zod"
import { ActivityAction } from "../../generated/prisma"

export const getActivityQuerySchema = z.object({
  facilityId: z
    .string("'facilityId' must be a string.")
    .uuid("'facilityId' must be a valid uuid.")
    .optional(),
  // Comma-separated list so the UI can filter by action GROUP
  // (e.g. "STAY_CHECKED_IN,STAY_CHECKED_OUT"). A single value works too.
  action: z
    .string("'action' must be a string.")
    .optional()
    .transform(value => {
      if (!value) return undefined
      return value.split(",").map(v => v.trim()).filter(Boolean)
    })
    .refine(
      values => !values || values.every(v => Object.values(ActivityAction).includes(v as ActivityAction)),
      "'action' contains an unknown activity action."
    )
    .transform(values => values as ActivityAction[] | undefined),
  actorId: z
    .string("'actorId' must be a string.")
    .uuid("'actorId' must be a valid uuid.")
    .optional(),
  // Free-text match against the denormalized display fields only
  // (targetLabel / actorName / actorEmail / facilityName) — never metadata.
  search: z
    .string("'search' must be a string.")
    .max(60, "Maximum 'search' length is 60.")
    .optional(),
  from: z.coerce.date("'from' must be a valid date.").optional(),
  to: z.coerce.date("'to' must be a valid date.").optional(),
  cursor: z
    .string("'cursor' must be a string.")
    .uuid("'cursor' must be a valid uuid.")
    .optional(),
  page: z.coerce
    .number("'page' must be a number.")
    .int("'page' must be an integer.")
    .min(1, "Minimum 'page' is 1.")
    .optional(),
  limit: z.coerce
    .number("'limit' must be a number.")
    .int("'limit' must be an integer.")
    .min(1, "Minimum 'limit' is 1.")
    .max(50, "Maximum 'limit' is 50.")
    .optional()
})

export const getActivityStatsQuerySchema = z.object({
  from: z.coerce.date("'from' must be a valid date.").optional(),
  to: z.coerce.date("'to' must be a valid date.").optional()
})
