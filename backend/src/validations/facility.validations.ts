import { z } from "zod";

const facilityStatusSchema = z.enum(["AVAILABLE", "UNAVAILABLE"])

const facilityFields = {
  name: z.string().trim().min(1).max(150),
  address: z.string().trim().min(1).max(300),
  note: z.string().trim().max(2000).nullable().optional(),
  status: facilityStatusSchema,
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
}

export const registerFacilitySchema = z.object({
  ...facilityFields,
  status: facilityStatusSchema.optional(),
})

export const updateFacilitySchema = z.object(facilityFields).partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one facility field is required."
)

export const facilityIdSchema = z.object({
  facilityId: z.uuid("Invalid facility id."),
})

export const resourceIdSchema = z.object({
  facilityId: z.uuid("Invalid facility id."),
  resourceId: z.uuid("Invalid resource id."),
})

export const createResourceSchema = z.object({
  name: z.string().trim().min(1).max(150),
  type: z.enum(["FIXED_VALUE", "DYNAMIC_VALUE"]).optional(),
  isAvailable: z.boolean().optional(),
  availableValue: z.number().int().nonnegative().optional(),
  maxValue: z.number().int().nonnegative().optional(),
}).refine(
  (data) => data.availableValue === undefined || data.maxValue === undefined || data.availableValue <= data.maxValue,
  "Available value cannot exceed maximum value."
)

export const updateResourceSchema = createResourceSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one resource field is required."
)