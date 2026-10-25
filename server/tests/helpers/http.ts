import type { NextFunction, Request, Response } from "express"

/** Minimal Express request stub — only the fields the auth handlers touch. */
export const makeReq = (over: Record<string, unknown> = {}) =>
  ({
    headers: {},
    cookies: {},
    body: {},
    query: {},
    ...over,
  }) as unknown as Request

/**
 * Minimal Express response stub. Captures what `ApiResponse.send()` writes so
 * tests can assert on the wire response (status + JSON body) and on cookies.
 */
export const makeRes = () => {
  const res: {
    statusCode: number
    body: unknown
    cookies: Record<string, string>
    status: (code: number) => typeof res
    json: (payload: unknown) => typeof res
    cookie: (name: string, value: string, opts?: unknown) => typeof res
    clearCookie: (name: string) => typeof res
  } = {
    statusCode: 0,
    body: undefined,
    cookies: {},
    status(code: number) {
      res.statusCode = code
      return res
    },
    json(payload: unknown) {
      res.body = payload
      return res
    },
    cookie(name: string, value: string) {
      res.cookies[name] = value
      return res
    },
    clearCookie(name: string) {
      delete res.cookies[name]
      return res
    },
  }
  return res
}

export type TestResponse = ReturnType<typeof makeRes>

/**
 * Run an async Express middleware the way Express would: resolve when it calls
 * `next()`, reject when it throws or calls `next(err)`.
 */
export const runMiddleware = (
  middleware: (req: Request, res: Response, next: NextFunction) => unknown,
  req: Request,
  res: TestResponse,
) =>
  new Promise<void>((resolve, reject) => {
    const next: NextFunction = (err?: unknown) => (err ? reject(err) : resolve())
    Promise.resolve(middleware(req, res as unknown as Response, next)).catch(reject)
  })
