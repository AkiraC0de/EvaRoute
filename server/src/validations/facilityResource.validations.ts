import { z } from "zod";

export const createResourceSchema = z
  .object({
    name: z
      .string("name is required.")
      .min(1, "name is required.")
      .trim(),
    type: z.enum(["QUANTITY", "BOOLEAN"], "type must be either QUANTITY or BOOLEAN."),
    isAvailable: z.boolean().optional(),
    availableValue: z.number().int().min(0).optional(),
    maxValue: z.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "QUANTITY") {
      if (data.availableValue === undefined) {
        ctx.addIssue({ code: "custom", path: ["availableValue"], message: "availableValue is required for QUANTITY resources." });
      }
      if (data.maxValue === undefined) {
        ctx.addIssue({ code: "custom", path: ["maxValue"], message: "maxValue is required for QUANTITY resources." });
      }
      if (data.availableValue !== undefined && data.maxValue !== undefined && data.availableValue > data.maxValue) {
        ctx.addIssue({ code: "custom", path: ["availableValue"], message: "availableValue cannot exceed maxValue." });
      }
      if (data.isAvailable !== undefined) {
        ctx.addIssue({ code: "custom", path: ["isAvailable"], message: "isAvailable must not be set for QUANTITY resources." });
      }
    }

    if (data.type === "BOOLEAN") {
      if (data.isAvailable === undefined) {
        ctx.addIssue({ code: "custom", path: ["isAvailable"], message: "isAvailable is required for BOOLEAN resources." });
      }
      if (data.availableValue !== undefined) {
        ctx.addIssue({ code: "custom", path: ["availableValue"], message: "availableValue must not be set for BOOLEAN resources." });
      }
      if (data.maxValue !== undefined) {
        ctx.addIssue({ code: "custom", path: ["maxValue"], message: "maxValue must not be set for BOOLEAN resources." });
      }
    }
  });

export const updateResourceSchema = z
  .object({
    name: z.string().min(1).trim().optional(),
    type: z.enum(["QUANTITY", "BOOLEAN"]).optional(),
    isAvailable: z.boolean().optional(),
    availableValue: z.number().int().min(0).optional(),
    maxValue: z.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "QUANTITY") {
      if (data.isAvailable !== undefined) {
        ctx.addIssue({ code: "custom", path: ["isAvailable"], message: "isAvailable must not be set for QUANTITY resources." });
      }
    }

    if (data.type === "BOOLEAN") {
      if (data.availableValue !== undefined) {
        ctx.addIssue({ code: "custom", path: ["availableValue"], message: "availableValue must not be set for BOOLEAN resources." });
      }
      if (data.maxValue !== undefined) {
        ctx.addIssue({ code: "custom", path: ["maxValue"], message: "maxValue must not be set for BOOLEAN resources." });
      }
    }

    if (
      data.type !== undefined &&
      data.isAvailable === undefined &&
      data.availableValue === undefined &&
      data.maxValue === undefined
    ) {
      // type changed without any value payload - reject, since value fields differ per type
      ctx.addIssue({ code: "custom", path: ["type"], message: "Changing type requires the matching value fields." });
    }
  });
