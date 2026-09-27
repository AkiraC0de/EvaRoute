import express from "express"

import { TokenType, UserRole } from "../../generated/prisma"

import { 
  handleLogin,
  handlePassReqReset,
  handlePassReset,
  handleVerifyResetPass,
  handleRefresh,
  handleSignOutAllDevices,
  handleSignOut,
} from "../controllers/auth.controllers"

import verifyToken from "../middlewares/verifyToken"
import verifyAuthentication from "../middlewares/verifyAuthentication"

const authRoute = express.Router()

authRoute.post("/login", handleLogin)

authRoute.get("/password/request-reset", handlePassReqReset) 

authRoute.post("/password/verify-reset", verifyToken(TokenType.REQ_RESET_PASS), handleVerifyResetPass) 
 
authRoute.post("/password/reset", verifyToken(TokenType.RESET_PASS), handlePassReset) 

authRoute.get("/refresh", handleRefresh) 

// Sign out to its current device
authRoute.post("/signout", verifyAuthentication, handleSignOut)

// Sign out of all other devices (keeps the calling device signed in)
authRoute.post("/signout-all", verifyAuthentication, handleSignOutAllDevices)

export default authRoute