import { z } from "zod"

export const getDashboardSummaryQuerySchema = z.object({
  // ADMIN may scope the summary to one facility; FACILITY_STAFF is always
  // forced to their own facility by the controller.
  facilityId: z
    .string("'facilityId' must be a string.")
    .uuid("'facilityId' must be a valid uuid.")
    .optional()
})
