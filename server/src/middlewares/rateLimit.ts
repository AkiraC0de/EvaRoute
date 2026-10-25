import { NextFunction, Request, Response } from "express"

import { RateLimitError } from "../core/ApiError.js"

/**
 * In-memory fixed-window rate limiter (no external dependency).
 *
 * Keyed per scope + client IP (+ an optional discriminator such as the
 * submitted email, so one noisy account cannot burn another account's
 * budget). Suitable for the single-instance deployment; a multi-instance
 * deployment would need a shared store (Redis) instead.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

// Periodically drop expired buckets so the map cannot grow unbounded.
setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}, 60_000).unref()

type RateLimitOptions = {
  windowMs: number
  max: number
  /** Bucket namespace, e.g. "auth:login". */
  scope: string
  /** Extra discriminator per request (e.g. the submitted email) — null = IP only. */
  keyFn?: (req: Request) => string | null
  message?: string
}

const clientIp = (req: Request) => req.ip ?? req.socket.remoteAddress ?? "unknown"

const rateLimit = ({ windowMs, max, scope, keyFn, message }: RateLimitOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const extra = keyFn ? keyFn(req) : null
    const key = `${scope}:${clientIp(req)}${extra ? `:${extra.toLowerCase()}` : ""}`
    const now = Date.now()

    let bucket = buckets.get(key)
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs }
      buckets.set(key, bucket)
    }
    bucket.count += 1

    if (bucket.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
      throw new RateLimitError(
        message ?? "Too many requests. Please try again later.",
        { retryAfterSeconds }
      )
    }

    next()
  }
}

export default rateLimit
