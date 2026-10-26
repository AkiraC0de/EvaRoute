import { NextFunction, Request, Response } from "express"

import ApiError from "../core/ApiError.js"
import { BadRequestMsgResponse, ConflictResponse, InternalResponse, NotFoundResponse } from "../core/ApiResponse.js"
import { Prisma } from "../../generated/prisma/client.js";

function errorHandler(){
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof ApiError){
      return err.handle(err, res)
    } 

    // Malformed JSON bodies arrive as a SyntaxError from express.json().
    if (err instanceof SyntaxError && "body" in err) {
      return new BadRequestMsgResponse("Invalid JSON body.").send(res)
    }

    // Check if the error is from Prisma
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // Log code + message with request context — NOT the full error object,
      // which can carry record values into log drains.
      console.error(`Prisma ${err.code} on ${req.method} ${req.originalUrl}: ${err.message}`);

      // Map integrity errors to honest client responses instead of a blanket
      // 500 (a duplicate is not an outage).
      switch (err.code) {
        case "P2002":
          return new ConflictResponse("A record with these details already exists.").send(res)
        case "P2025":
          return new NotFoundResponse("The requested resource could not be found.").send(res)
        case "P2003":
          return new BadRequestMsgResponse("The operation conflicts with related records.").send(res)
        default:
          return new InternalResponse("Internal server error.").send(res)
      }
    }

    console.error(`Unexpected error on ${req.method} ${req.originalUrl}:`, err)
    const message = process.env.NODE_ENV == "production" ? "Internal server error." : err.message
    new InternalResponse(message).send(res)
  }
}

export default errorHandler