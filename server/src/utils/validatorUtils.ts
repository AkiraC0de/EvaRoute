import { z } from "zod";
import { BadRequestError, BadRequestMsgError, NoEntryError } from "../core/ApiError.js";

export type FieldError = {
  field: string,
  message: string,
}

type DataSource = "body" | "query"

export const paramErr = (names: string[]) =>
  `Missing required parameter${names.length > 1 ? 's' : ''}: ${names.join(', ')}.`

// Postgres @db.Uuid accepts any 8-4-4-4-12 hex shape (including nil and
// non-RFC variants), so match that — never reject an id the DB would take.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Validates a single path parameter as a UUID BEFORE it reaches Prisma —
 * a malformed id would otherwise surface as a driver error the global
 * handler maps to a 500. Missing values get the same message the `if (!x)`
 * guards used; malformed ones get a 400 naming the parameter. Accepts the
 * Express 5 `string | string[]` param shape; a repeated param is malformed.
 */
export function parseUuidParam(value: string | string[] | undefined, name: string): string {
  if (!value) throw new BadRequestMsgError(paramErr([name]))
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) throw new BadRequestMsgError(`'${name}' must be a valid uuid.`)
  return value
}

export function validateData<TSchema extends z.ZodTypeAny>(schema: TSchema, data: unknown, source: DataSource = "body", ): z.infer<TSchema> {
  if(data == undefined) throw new NoEntryError()

  const result = schema.safeParse(data)

  if (!result.success) {
    const errors: FieldError[] = result.error.issues.map((issue) => ({
      field: issue.path.join(".") || "root",
      message: issue.message,
    }))

    throw new BadRequestError(`Failed validation in ${source}.`, { errors })
  }

  return result.data
}