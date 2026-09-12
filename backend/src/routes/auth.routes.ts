import express from "express"

import { TokenType } from "../../generated/prisma"

import { 
  handleLogin,
  handleRegister,
  handlePassReqReset,
  handlePassReset,
  handleVerifyResetPass
} from "../controllers/auth.controllers"
import verifyToken from "../middlewares/verifyToken"


const authRoute = express.Router()

authRoute.post("/register", handleRegister)

authRoute.post("/login", handleLogin)

authRoute.get("/password/request-reset", handlePassReqReset) 

authRoute.post("/password/verify-reset", verifyToken(TokenType.REQ_RESET_PASS), handleVerifyResetPass) 
 
authRoute.post("/password/reset", handlePassReset) // not done

export default authRoute