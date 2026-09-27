import crypto from "crypto"
import { Request, Response } from "express"

import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse"
import { BadRequestMsgError, NotFoundError } from "../core/ApiError"

import facilityServices from "../services/facility.services"
import facilityStaffServices from "../services/facilityStaff.services"
import userServices from "../services/user.services"
import { UserRole } from "../../generated/prisma"
import { assertFacilityAccess } from "../utils/facilityUtils"
import { generateCryptoToken, requireAuth } from "../utils/authUtils"
import bcrypt from "bcryptjs"
import refreshTokenServices from "../services/refreshToken.services"
import { validateData } from "../utils/validatorUtils"
import { listStaffQuerySchema, patchStaffSchema, registerSchema } from "../validations/facilityStaff.validations"

export const handleGetFacilityStaffs = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  if(!facilityId){
    throw new BadRequestMsgError("'facilityId' is required as a parameter.")
  }

  const facility = await assertFacilityAccess(req, facilityId)

  const staffs = await facilityStaffServices.findByFacilityId(facilityId)
  const formatedStaffs = staffs.map(staff => ({
    id: staff.id,
    userId: staff.userId,
    email: staff.user.email,
    firstName: staff.user.firstName,
    lastName: staff.user.lastName,
    joinedAt: staff.joinedAt
  }))

  return new SuccessResponse(
    `Staffs of facility ${facility.name}.`,
    {
      staffs: formatedStaffs,
      count: formatedStaffs.length
    }
  ).send(res)
}

// Transfer or Assign Staff
export const handleAssignStaff = async (req: Request, res: Response) => {
  const userId = req.params.userId as string
  if(!userId){
    throw new BadRequestMsgError("'userId' is required as a parameter.")
  }

  const user = await userServices.findById(userId)
  if(!user){
    throw new NotFoundError("User not found.")
  }

  if (user.role !== UserRole.FACILITY_STAFF) {
    throw new BadRequestMsgError("Only facility staff users can be assigned to a facility.")
  }

  const facilityId = req.params.facilityId as string
  const facility = await facilityServices.findById(facilityId)
  if(!facility){
    throw new NotFoundError("Facility not found.")
  }

  const isAlreadyMember = await facilityStaffServices.findStaff(facilityId, userId)
  if(isAlreadyMember){
    throw new BadRequestMsgError("This staff is already part of this facility.")
  }

  const currentMembership = await facilityStaffServices.findMembershipByUserId(userId)
  if(currentMembership){
    await facilityStaffServices.transferStaff(userId, facilityId)

    return new SuccessMsgResponse(`${user.firstName} ${user.lastName} has been transferred from facility ${currentMembership.facility.name} to facility ${facility.name}.`).send(res)
  }

  await facilityStaffServices.create(facilityId, userId)

  return new SuccessMsgResponse(`${user.firstName} ${user.lastName} is now a staff of facility ${facility.name}.`).send(res)
}

export const handleDismissStaff = async (req: Request, res: Response) => {
  const userId = req.params.userId as string
  if(!userId){
    throw new BadRequestMsgError("'userId' is required as a parameter.")
  }

  const user = await userServices.findById(userId)
  if(!user){
    throw new NotFoundError("User not found.")
  }

  const membership = await facilityStaffServices.findMembershipByUserId(userId)
  if(!membership){
    throw new BadRequestMsgError("User is not assigned to any facility.")
  }

  await facilityStaffServices.deleteStaff(membership.facilityId, userId)

  return new SuccessMsgResponse(`${user.firstName} ${user.lastName} has been removed as a staff of facility ${membership.facility.name}.`).send(res)
}


// NEW

const paramErr = (name: string) => `'${name}' is required as a parameter.`

const toStaffDTO = (user: {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  isActive: boolean
  isSetupDone: boolean
  createdAt: Date
  facilityStaff: { facility: { id: string; name: string } } | null
}) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  isActive: user.isActive,
  isSetupDone: user.isSetupDone,
  createdAt: user.createdAt,
  facility: user.facilityStaff
    ? { id: user.facilityStaff.facility.id, name: user.facilityStaff.facility.name }
    : null,
})

export const handleCreateStaffAccount = async (req: Request, res: Response) => {
  const userData = validateData<typeof registerSchema>(registerSchema, req.body)
  const { email } = userData

  const existingUser = await userServices.findByEmail(email)
  if(existingUser){
    throw new BadRequestMsgError("This email address is already registered.")
  }

  const defaultPassword = crypto.randomBytes(8).toString('hex')
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
    throw new BadRequestMsgError(paramErr("userId"))
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
    throw new BadRequestMsgError(paramErr("userId"))
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
    throw new BadRequestMsgError(paramErr("userId"))
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
    throw new BadRequestMsgError(paramErr("userId"))
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
  await refreshTokenServices.deleteAllByUserId(userId)

  return new SuccessMsgResponse(`Account for ${user.email} has been deactivated and signed out from all devices.`).send(res)
}

export const handleDeleteStaff = async (req: Request, res: Response) => {
  const { userId: callerId } = requireAuth(req)
  const userId = req.params.userId as string
  if (!userId) {
    throw new BadRequestMsgError(paramErr("userId"))
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

export const handleResetStaffPassword = async (req: Request, res: Response) => {
  const userId = req.params.userId as string
  if (!userId) {
    throw new BadRequestMsgError(paramErr("userId"))
  }

  const user = await userServices.findById(userId)
  if (!user || user.role !== UserRole.FACILITY_STAFF) {
    throw new NotFoundError("Staff account not found.")
  }

  const defaultPassword = generateCryptoToken().slice(0, 16)
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  await userServices.updatePassword(userId, hashedPassword)
  await refreshTokenServices.deleteAllByUserId(userId)
  if (!user.isActive) {
    await userServices.setActive(userId, true)
  }

  return new SuccessResponse(
    `Password for ${user.email} has been reset. Share it with the staff securely; they must change it after logging in.`,
    { defaultPassword }
  ).send(res)
}
