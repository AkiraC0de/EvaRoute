import { z } from "zod";

const stayMemberSchema = z.object({
  fullName: z
    .string("fullName is required.")
    .trim()
    .min(1, "fullName is required.")
    .max(120, "fullName must be at most 120 characters."),
  ageGroup: z.enum(["CHILD", "ADULT"], "ageGroup must be either CHILD or ADULT."),
});

export const checkInSchema = z.object({
  familyName: z
    .string("familyName is required.")
    .trim()
    .min(1, "familyName is required.")
    .max(120, "familyName must be at most 120 characters."),
  members: z
    .array(stayMemberSchema, "members is required.")
    .min(1, "At least one family member is required.")
    .max(50, "A household cannot exceed 50 members."),
});

export const getStaysQuerySchema = z.object({
  status: z
    .enum(["ACTIVE", "CHECKED_OUT"], "status must be either ACTIVE or CHECKED_OUT.")
    .optional(),
});
