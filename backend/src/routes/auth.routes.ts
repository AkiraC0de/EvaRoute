import express from "express"

import { 
  handleLogin,
  handleRegister
} from "../controllers/auth.controllers"

const authRoute = express.Router()

authRoute.post("/register", handleRegister)

authRoute.post("/login", handleLogin)

export default authRoute