import { z } from "zod";

const stayMemberSchema = z.object({
  fullName: z
    .string("fullName is required.")
    .min(1, "fullName is required.")
    .trim(),
  ageGroup: z.enum(["CHILD", "ADULT"], "ageGroup must be either CHILD or ADULT."),
});

export const checkInSchema = z.object({
  familyName: z
    .string("familyName is required.")
    .min(1, "familyName is required.")
    .trim(),
  members: z
    .array(stayMemberSchema, "members is required.")
    .min(1, "At least one family member is required."),
});

export const getStaysQuerySchema = z.object({
  status: z
    .enum(["ACTIVE", "CHECKED_OUT"], "status must be either ACTIVE or CHECKED_OUT.")
    .optional(),
});
