import express, {Request, Response} from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

import authRoute from "./routes/auth.routes"
import errorHandler from "./middlewares/errorHandler"

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({credentials: true}))

// Endpoints
app.use("/api/v1/auth", authRoute)

// Fallback endpoint for unkwon route 
app.use((req: Request, res: Response) => {
  res.status(400).json({
    message: "Unknown endpoint.",
    endpoints: [
      "POST api/v1/auth/login",
      "POST api/v1/auth/register",
      "POST api/v1/auth/password/request-reset",
      "POST api/v1/auth/password/reset"
    ]
  })
})

app.use(errorHandler())

app.listen(process.env.PORT, () => {
  console.log("Backend successfully started at PORT: ", process.env.PORT)
})