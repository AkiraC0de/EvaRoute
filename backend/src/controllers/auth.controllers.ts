import {Request, Response } from "express"

export const handleRegister = (req: Request, res: Response) => {
  res.status(200).json("TEST")
}