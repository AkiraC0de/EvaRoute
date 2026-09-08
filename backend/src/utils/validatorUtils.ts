import { z } from "zod";
import { BadRequestError, NoEntryError } from "../core/ApiError";

export type FieldError = {
  field: string;
  message: string,
}

export function validateData<TSchema extends z.ZodTypeAny>(schema: TSchema, data: unknown ): z.infer<TSchema> {
  if(data == undefined) throw new NoEntryError()

  const result = schema.safeParse(data)

  if (!result.success) {
    const errors: FieldError[] = result.error.issues.map((issue) => ({
      field: issue.path.join(".") || "root",
      message: issue.message,
    }))

    throw new BadRequestError("Failed validation.", { errors })
  }

  return result.data
}