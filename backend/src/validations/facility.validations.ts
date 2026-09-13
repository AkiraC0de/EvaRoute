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
  longitude: z
    .number("longtitude is required.")
    .min(-180)
    .max(180),
  latitude: z
    .number("latitude is required.")
    .min(-90)
    .max(90),
})