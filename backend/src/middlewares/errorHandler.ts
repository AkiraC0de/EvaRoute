import { NextFunction, Request, Response } from "express"

import ApiError from "../core/ApiError"
import { InternalResponse } from "../core/ApiResponse"
import { Prisma } from "../../generated/prisma/client";

function errorHandler(){
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof ApiError){
      return err.handle(err, res)
    } 
    
    // Check if the error is from Prisma
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Unhandled prisma error occured! Handle this immediately:", err);

     return new InternalResponse("Internal server error.").send(res);
    }

    console.error("Unpexted error happened: ", err.message)
    new InternalResponse("Internal server error.").send(res)
  }
}

export default errorHandler