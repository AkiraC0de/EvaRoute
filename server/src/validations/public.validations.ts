import { z } from "zod"
import { PUBLIC_FACILITY } from "../configs/publicConfig"

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
    .max(PUBLIC_FACILITY.MAX_DISTANCE_KM, `distance cannot exceed ${PUBLIC_FACILITY.MAX_DISTANCE_KM} kilometers.`)
    .optional(),
})

export const publicRouteQuerySchema = z.object({
  fromLong: z.coerce
    .number("fromLong is required.")
    .min(-180, "fromLong must be between -180 and 180.")
    .max(180, "fromLong must be between -180 and 180."),
  fromLat: z.coerce
    .number("fromLat is required.")
    .min(-90, "fromLat must be between -90 and 90.")
    .max(90, "fromLat must be between -90 and 90."),
})

export type PublicFacilityQuery = z.infer<typeof publicFacilityQuerySchema>
export type PublicRRouteQuery = z.infer<typeof publicRouteQuerySchema>
