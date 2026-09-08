import express from "express"

import { 
  handleRegister
} from "../controllers/auth.controllers"

const authRoute = express.Router()

authRoute.get("/register", handleRegister)

export default authRoute