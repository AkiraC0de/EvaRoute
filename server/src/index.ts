import app from "./app.js"
import prisma from "./lib/prisma.js"
import tokenService from "./services/token.services.js"

// ---------------------------------------------------------------------------
// Boot-time configuration validation: fail fast and loudly instead of running
// with silently broken auth, a random port, or an open CORS policy.
// ---------------------------------------------------------------------------
const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET_KEY"] as const
const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name])
if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(", ")}. Refusing to start.`)
  process.exit(1)
}

if (!process.env.GRAPHOPPER_API_KEY) {
  console.warn("GRAPHOPPER_API_KEY is not set — the public routing endpoint will respond with 502.")
}

if (!process.env.CORS_ORIGINS && process.env.NODE_ENV === "production") {
  console.error("CORS_ORIGINS must be set in production (comma-separated allowlist). Refusing to start.")
  process.exit(1)
}

const port = Number(process.env.PORT ?? 3000)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`PORT must be an integer between 1 and 65535 (got "${process.env.PORT}"). Refusing to start.`)
  process.exit(1)
}

// AUTH-13: purge expired auth rows at boot and hourly (a failed purge is
// logged and retried at the next tick — it must never take the API down).
const purgeAuthRows = () =>
  tokenService.purgeExpiredAuthRows().catch((err) =>
    console.error("Auth-row purge failed:", err?.message ?? err)
  )
purgeAuthRows()
setInterval(purgeAuthRows, 60 * 60_000).unref()

const server = app.listen(port, () => {
  console.log("Backend successfully started at PORT: ", port)
})

// Graceful shutdown + process-level guards: a deploy restart must drain
// in-flight writes instead of dropping them silently, and an unhandled
// rejection must not leave a half-alive process serving requests.
const shutdown = (signal: string) => {
  console.log(`${signal} received — shutting down.`)
  server.close(async () => {
    await prisma.$disconnect().catch(() => {})
    process.exit(0)
  })
  // Hard exit if draining hangs.
  setTimeout(() => process.exit(1), 10_000).unref()
}
process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason)
  process.exit(1)
})
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err)
  process.exit(1)
})
