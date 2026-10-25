import express, {Request, Response} from "express"
import cookieParser from "cookie-parser"
import cors from "cors"


import errorHandler from "./middlewares/errorHandler.js"
import { ENDPOINTS_LIST } from "./configs/mainConfig.js"

import authRoute from "./routes/auth.routes.js"
import facilityRoute from "./routes/facility.routes.js"
import publicRoute from "./routes/public.routes.js"
import staffRoute from "./routes/staff.routes.js"
import activityRoute from "./routes/activity.routes.js"
import dashboardRoute from "./routes/dashboard.routes.js"

// ---------------------------------------------------------------------------
// The Express app is constructed HERE (no listen, no boot validation, no
// process lifecycle) so the HTTP test suite can mount it on an ephemeral
// port. index.ts owns env validation, the listener, the auth-row purge
// schedule and graceful shutdown.
// ---------------------------------------------------------------------------
const DEV_DEFAULT_ORIGINS = "http://localhost:5173,http://localhost:5174"

const allowedOrigins = (process.env.CORS_ORIGINS || DEV_DEFAULT_ORIGINS)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

const app = express()

// Deployed behind exactly one reverse proxy (Vercel/Render): trust the LAST
// X-Forwarded-For entry so req.ip (and any rate limiting keyed on it) cannot
// be spoofed with a client-supplied first entry.
app.set("trust proxy", 1)

app.use(express.json({ limit: "100kb" }))
app.use(cookieParser())

// Minimal security headers — the API serves JSON to first-party clients only.
app.use((req: Request, res: Response, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("X-Frame-Options", "DENY")
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
  next()
})

app.use(cors({
  credentials: true,
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // No Origin header = same-origin / non-browser caller (curl, server-to-server)
    // — CORS does not apply. Otherwise the origin must be on the allowlist:
    // never reflect arbitrary origins with credentials enabled (an unset
    // CORS_ORIGINS used to allow every hostile site in).
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }
    callback(null, false)
  }
}))

// Endpoints
app.use("/api/v1/auth", authRoute)
app.use("/api/v1/facility", facilityRoute)
app.use("/api/v1/public", publicRoute)
app.use("/api/v1/staff", staffRoute)
app.use("/api/v1/activity", activityRoute)
app.use("/api/v1/dashboard", dashboardRoute)

// Root: the endpoint index (documented public surface). GET only, so unknown
// paths fall through to the 404 below instead of being swallowed here.
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to EvaRoute API. Server is working.",
    endpoints: ENDPOINTS_LIST
  })
})

// Fallback endpoint for unknown routes (no endpoint inventory leak).
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: "Unknown endpoint."
  })
})

app.use(errorHandler())

export default app
