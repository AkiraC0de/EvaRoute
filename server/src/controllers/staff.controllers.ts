import { Request, Response } from "express"
import bcrypt from "bcryptjs"

import userServices from "../services/user.services.js"
import refreshTokenService from "../services/refreshToken.services.js"
import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse.js"
import { BadRequestMsgError, NotFoundError } from "../core/ApiError.js"
import { requireAuth, generateCryptoToken } from "../utils/authUtils.js"
import { toStaffDTO } from "../utils/staffUtils.js"
import { validateData, paramErr } from "../utils/validatorUtils.js"
import { DEFAULT_PASSWORD_LENGTH } from "../configs/tokenConfig.js"
import { ApiMailer } from "../core/ApiMailer.js"
import { registerSchema, listStaffQuerySchema, patchStaffSchema } from "../validations/staff.validations.js"
import { UserRole, ActivityAction } from "../../generated/prisma/index.js"
import { logActivity } from "../utils/activityUtils.js"

export const handleCreateStaffAccount = async (req: Request, res: Response) => {
  const userData = validateData<typeof registerSchema>(registerSchema, req.body)
  const { email } = userData

  const existingUser = await userServices.findByEmail(email)
  if (existingUser) {
    throw new BadRequestMsgError("This email address is already registered.")
  }

  const defaultPassword = generateCryptoToken().slice(0, DEFAULT_PASSWORD_LENGTH)
  const hashedPassword = await bcrypt.hash(defaultPassword, 12)

  const createdUser = await userServices.create({
    email,
    password: hashedPassword,
  })

  await logActivity(req, ActivityAction.STAFF_ACCOUNT_CREATED, {
    target: { id: createdUser.id, label: email }
  })

  let emailSent = true
  try {
    await ApiMailer.sendStaffWelcome(email, email.split("@")[0], defaultPassword)
  } catch {
    emailSent = false
  }

  return new SuccessResponse(
    emailSent
      ? "New account has been created."
      : "New account has been created, but the welcome email could not be sent. Share the password with the staff manually.",
    {
      email,
      defaultPassword,
      emailSent
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

  await logActivity(req, ActivityAction.STAFF_ACCOUNT_UPDATED, {
    target: { id: user.id, label: user.email },
    metadata: {
      before: { firstName: user.firstName, lastName: user.lastName },
      after: { firstName: updatedUser.firstName, lastName: updatedUser.lastName }
    }
  })

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

  await logActivity(req, ActivityAction.STAFF_ACTIVATED, {
    target: { id: user.id, label: user.email }
  })

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

  await logActivity(req, ActivityAction.STAFF_DEACTIVATED, {
    target: { id: user.id, label: user.email }
  })

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
  const hashedPassword = await bcrypt.hash(defaultPassword, 12)

  await userServices.updatePassword(userId, hashedPassword)
  await refreshTokenService.deleteAllByUserId(userId)
  if (!user.isActive) {
    await userServices.setActive(userId, true)
  }

  // Mail delivery is a convenience — the password was ALREADY rotated above,
  // so a send failure must not 500: that would strand the staff with a temp
  // password nobody has seen (it exists only in the unsent email) while the
  // admin sees nothing. Return it for manual sharing and say so.
  let emailSent = true
  try {
    await ApiMailer.sendStaffPasswordReset(user.email, user.email.split("@")[0], defaultPassword)
  } catch {
    emailSent = false
  }

  // Audit the reset — never the generated password.
  await logActivity(req, ActivityAction.STAFF_PASSWORD_RESET, {
    target: { id: user.id, label: user.email }
  })

  return new SuccessResponse(
    emailSent
      ? `Password for ${user.email} has been reset. Share it with the staff securely; they must change it after logging in.`
      : `Password for ${user.email} has been reset, but the email could not be sent. Share the password with the staff manually — they must change it after logging in.`,
    { defaultPassword, emailSent }
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

  await logActivity(req, ActivityAction.STAFF_DELETED, {
    target: { id: userId, label: user.email }
  })

  return new SuccessMsgResponse(`Account for ${user.email} has been permanently deleted.`).send(res)
}
