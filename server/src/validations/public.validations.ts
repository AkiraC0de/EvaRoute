import { z } from "zod"

// Query strings arrive as strings, so coerce them to numbers.
export const publicFacilityQuerySchema = z.object({
  fromLong: z.coerce
    .number("fromLong is required.")
    .min(-180, "fromLong must be between -180 and 180.")
    .max(180, "fromLong must be between -180 and 180."),
  fromLat: z.coerce
    .number("fromLat is required.")
    .min(-90, "fromLat must be between -90 and 90.")
    .max(90, "fromLat must be between -90 and 90."),
  distance: z.coerce
    .number("distance must be a number.")
    .positive("distance must be a positive number of kilometers.")
    .max(200, "distance cannot exceed 200 kilometers.")
    .optional(),
})

export type PublicFacilityQuery = z.infer<typeof publicFacilityQuerySchema>
