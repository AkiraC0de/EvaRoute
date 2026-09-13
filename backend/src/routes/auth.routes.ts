import express from "express"

import { TokenType, UserRole } from "../../generated/prisma"

import { 
  handleLogin,
  handleRegister,
  handlePassReqReset,
  handlePassReset,
  handleVerifyResetPass,
  handleRefresh,
} from "../controllers/auth.controllers"

import verifyToken from "../middlewares/verifyToken"
import verifyAuthentication from "../middlewares/verifyAuthentication"
import verifyAuthorization from "../middlewares/verifyAuthorization"


const authRoute = express.Router()

authRoute.post("/register", verifyAuthentication, verifyAuthorization([UserRole.ADMIN]), handleRegister)

authRoute.post("/login", handleLogin)

authRoute.get("/password/request-reset", handlePassReqReset) 

authRoute.post("/password/verify-reset", verifyToken(TokenType.REQ_RESET_PASS), handleVerifyResetPass) 
 
authRoute.post("/password/reset", verifyToken(TokenType.RESET_PASS), handlePassReset) 

authRoute.get("/refresh", handleRefresh) 

export default authRoute