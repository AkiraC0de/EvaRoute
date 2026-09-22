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