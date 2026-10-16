import type { Request, Response, NextFunction} from "express"
import { BadRequestMsgError, UnauthorizedError } from "../core/ApiError.js"
import tokenServices from "../services/token.services.js"
import { TokenType } from "../../generated/prisma/index.js"
import { cryptoHash, cryptoHashCompare, extractBearerToken } from "../utils/authUtils.js"

const verifyToken = (tokenType: TokenType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = extractBearerToken(req)

    const tokenHash = cryptoHash(token)

    const tokenRecord  = await tokenServices.findByToken(tokenHash, tokenType)
    if (!tokenRecord || tokenRecord.type !== tokenType) {
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