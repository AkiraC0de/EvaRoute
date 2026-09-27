import { Request, Response } from "express"
import bcrypt from "bcryptjs"

import userServices from "../services/user.services"
import refreshTokenService from "../services/refreshToken.services"
import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse"
import { BadRequestMsgError, NotFoundError } from "../core/ApiError"
import { requireAuth, generateCryptoToken } from "../utils/authUtils"
import { toStaffDTO } from "../utils/staffUtils"
import { validateData, paramErr } from "../utils/validatorUtils"
import { DEFAULT_PASSWORD_LENGTH } from "../configs/tokenConfig"
import { registerSchema, listStaffQuerySchema, patchStaffSchema } from "../validations/staff.validations"
import { UserRole } from "../../generated/prisma"

export const handleCreateStaffAccount = async (req: Request, res: Response) => {
  const userData = validateData<typeof registerSchema>(registerSchema, req.body)
  const { email } = userData

  const existingUser = await userServices.findByEmail(email)
  if (existingUser) {
    throw new BadRequestMsgError("This email address is already registered.")
  }

  const defaultPassword = generateCryptoToken().slice(0, DEFAULT_PASSWORD_LENGTH)
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  await userServices.create({
    email,
    password: hashedPassword,
  })

  return new SuccessResponse(
    "New account has been created.", {
      email,
      defaultPassword
    }
  ).send(res)
}

export const handleListStaffs = async (req: Request, res: Response) => {
  const query = validateData<typeof listStaffQuerySchema>(listStaffQuerySchema, req.query, "query")

  const staffs = await userServices.findManyStaff(query)
  const formatedStaffs = staffs.map(toStaffDTO)

  return new SuccessResponse("All staff accounts fetched.", {
    staffs: formatedStaffs,
    count: formatedStaffs.length
  }).send(res)
}

export const handleGetStaff = async (req: Request, res: Response) => {
  const userId = req.params.userId as string
  if (!userId) {
    throw new BadRequestMsgError(paramErr(["userId"]))
  }

  const user = await userServices.findByIdWithFacility(userId)
  if (!user || user.role !== UserRole.FACILITY_STAFF) {
    throw new NotFoundError("Staff account not found.")
  }

  return new SuccessResponse("Staff account fetched.", { staff: toStaffDTO(user) }).send(res)
}

export const handlePatchStaff = async (req: Request, res: Response) => {
  const userId = req.params.userId as string
  if (!userId) {
    throw new BadRequestMsgError(paramErr(["userId"]))
  }

  const user = await userServices.findById(userId)
  if (!user || user.role !== UserRole.FACILITY_STAFF) {
    throw new NotFoundError("Staff account not found.")
  }

  const data = validateData<typeof patchStaffSchema>(patchStaffSchema, req.body)

  const updatedUser = await userServices.update(userId, data)

  return new SuccessResponse("Staff account updated.", {
    staff: {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      isActive: updatedUser.isActive,
      isSetupDone: updatedUser.isSetupDone,
      createdAt: updatedUser.createdAt
    }
  }).send(res)
}

export const handleActivateStaff = async (req: Request, res: Response) => {
  const userId = req.params.userId as string
  if (!userId) {
    throw new BadRequestMsgError(paramErr(["userId"]))
  }

  const user = await userServices.findById(userId)
  if (!user || user.role !== UserRole.FACILITY_STAFF) {
    throw new NotFoundError("Staff account not found.")
  }

  if (user.isActive) {
    throw new BadRequestMsgError("This account is already active.")
  }

  await userServices.setActive(userId, true)

  return new SuccessMsgResponse(`Account for ${user.email} has been activated.`).send(res)
}

export const handleDeactivateStaff = async (req: Request, res: Response) => {
  const { userId: callerId } = requireAuth(req)
  const userId = req.params.userId as string
  if (!userId) {
    throw new BadRequestMsgError(paramErr(["userId"]))
  }

  if (callerId === userId) {
    throw new BadRequestMsgError("You cannot deactivate your own account.")
  }

  const user = await userServices.findById(userId)
  if (!user || user.role !== UserRole.FACILITY_STAFF) {
    throw new NotFoundError("Staff account not found.")
  }

  if (!user.isActive) {
    throw new BadRequestMsgError("This account is already deactivated.")
  }

  await userServices.setActive(userId, false)
  await refreshTokenService.deleteAllByUserId(userId)

  return new SuccessMsgResponse(`Account for ${user.email} has been deactivated and signed out from all devices.`).send(res)
}

export const handleResetStaffPassword = async (req: Request, res: Response) => {
  const userId = req.params.userId as string
  if (!userId) {
    throw new BadRequestMsgError(paramErr(["userId"]))
  }

  const user = await userServices.findById(userId)
  if (!user || user.role !== UserRole.FACILITY_STAFF) {
    throw new NotFoundError("Staff account not found.")
  }

  const defaultPassword = generateCryptoToken().slice(0, DEFAULT_PASSWORD_LENGTH)
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  await userServices.updatePassword(userId, hashedPassword)
  await refreshTokenService.deleteAllByUserId(userId)
  if (!user.isActive) {
    await userServices.setActive(userId, true)
  }

  return new SuccessResponse(
    `Password for ${user.email} has been reset. Share it with the staff securely; they must change it after logging in.`,
    { defaultPassword }
  ).send(res)
}

export const handleDeleteStaff = async (req: Request, res: Response) => {
  const { userId: callerId } = requireAuth(req)
  const userId = req.params.userId as string
  if (!userId) {
    throw new BadRequestMsgError(paramErr(["userId"]))
  }

  if (callerId === userId) {
    throw new BadRequestMsgError("You cannot delete your own account.")
  }

  const user = await userServices.findById(userId)
  if (!user || user.role !== UserRole.FACILITY_STAFF) {
    throw new NotFoundError("Staff account not found.")
  }

  await userServices.deleteById(userId)

  return new SuccessMsgResponse(`Account for ${user.email} has been permanently deleted.`).send(res)
}
