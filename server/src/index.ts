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

const app = express()

const allowedOrigins = process.env.CORS_ORIGINS
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  credentials: true,
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || !allowedOrigins || allowedOrigins.includes(origin)) {
      callback(null, true) // reflect the request origin
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

app.use("/", (req: Request, res: Response) => {
  res.status(400).json({
    message: "Welcome to EvaRoute API. Server is working.",
    endpoints: ENDPOINTS_LIST
  })
})

// Fallback endpoint for unknown routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: "Unknown endpoint.",
    endpoints: ENDPOINTS_LIST
  })
})

app.use(errorHandler())

app.listen(process.env.PORT, () => {
  console.log("Backend successfully started at PORT: ", process.env.PORT)
})