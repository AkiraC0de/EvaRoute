import express, {Request, Response} from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

import authRoute from "./routes/auth.routes"

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({credentials: true}))

// Endpoints
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "EvaRoute API is running.",
    endpoints: ["api/v1/auth"]
  })
})

app.use("/api/v1/auth", authRoute)

app.listen(process.env.PORT, () => {
  console.log("Backend successfully started at PORT: ", process.env.PORT)
})