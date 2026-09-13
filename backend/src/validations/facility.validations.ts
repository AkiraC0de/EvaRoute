import z from "zod";

export const registerFacilitySchema = z.object({
  name: z
    .string()
    .trim(),
  address: z
    .string()
    .trim(),
  note: z
    .string()
    .trim()
    .optional(),
  longitude: z
    .number()
    .min(-180)
    .max(180),
  latitude: z
    .number()
    .min(-90)
    .max(90),
})