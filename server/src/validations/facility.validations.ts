import z from "zod";

export const registerFacilitySchema = z.object({
  name: z
    .string("name is required.")
    .trim(),
  address: z
    .string("address is required.")
    .trim(),
  note: z
    .string()
    .trim()
    .optional(),
  maxCapacity: z
    .number("maxCapacity is required"),
  longitude: z
    .number("longtitude is required.")
    .min(-180)
    .max(180),
  latitude: z
    .number("latitude is required.")
    .min(-90)
    .max(90),
  // Optional at registration (defaults to AVAILABLE) — lets an admin open a
  // center as unavailable without editing it right after.
  status: z.enum(["AVAILABLE", "UNAVAILABLE"]).optional(),
  // Optional initial availability for the three mandatory essentials. The
  // server always creates all three regardless — entries here only set the
  // starting status (omitted entries default to Unavailable).
  resources: z
    .array(
      z.object({
        essentialType: z.enum(
          ["ELECTRICITY", "WATER", "COMFORT_ROOM"],
          "unknown essential resource type.",
        ),
        isAvailable: z.boolean("isAvailable must be true or false."),
      }),
      "resources must be a list.",
    )
    .max(3, "At most one entry per essential resource.")
    .optional(),
})

export const getFacilityQuerySchema = z.object({
  status: z.enum(["AVAILABLE", "UNAVAILABLE"]).optional(),
  // `?deleted=true` lists soft-deleted facilities (ADMIN only — see
  // handleGetFacility); absent/false keeps the current active-only listing.
  deleted: z
    .enum(["true", "false"], "deleted must be either true or false.")
    .optional()
    .transform((value) => value === "true"),
})
export const patchFacilitySchema = z.object({
  name: z
    .string("name must be a string.")
    .trim()
    .optional(),
  address: z
    .string("address must be a string.")
    .trim()
    .optional(),
  note: z
    .string("note must be a string.")
    .trim()
    .optional(),
  maxCapacity: z
    .number("maxCapacity is required")
    .optional(),
  status: z
    .enum(["AVAILABLE", "UNAVAILABLE"], "status must be either AVAILABLE or UNAVAILABLE.")
    .optional(),
  longitude: z
    .number("longitude must be a number.")
    .min(-180)
    .max(180)
    .optional(),
  latitude: z
    .number("latitude must be a number.")
    .min(-90)
    .max(90)
    .optional(),
});