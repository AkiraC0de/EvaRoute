import type { Request, Response, NextFunction} from "express"
import { BadRequestMsgError, UnauthorizedError } from "../core/ApiError"
import tokenServices from "../services/token.services"
import { TokenType } from "../../generated/prisma"
import { extractBearerToken } from "../utils/authUtils"

const verifyToken = (tokenType: TokenType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = extractBearerToken(req)

    const tokenRecord  = await tokenServices.findByToken(token, tokenType)
    if(!tokenRecord ){
      throw new UnauthorizedError("Token is invalid.")
    }

    if(tokenRecord.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedError("Token has expired.")
    } 
    
    req.token = tokenRecord

    next()
  }
}

export default verifyToken