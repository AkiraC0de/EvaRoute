import express from "express"

import { 
  handleRegister
} from "../controllers/auth.controllers"

const authRoute = express.Router()

authRoute.post("/register", handleRegister)

export default authRoute