import express from "express"

import { 
  handleLogin,
  handleRegister,
  handlePassReqReset,
  handlePassReset
} from "../controllers/auth.controllers"

const authRoute = express.Router()

authRoute.post("/register", handleRegister)

authRoute.post("/login", handleLogin)

authRoute.get("/password/request-reset", handlePassReqReset) 

authRoute.post("/password/request-reset", ) 
 
authRoute.post("/password/reset", handlePassReset) // not done

export default authRoute