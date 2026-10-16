import { Request, Response } from "express"

import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse.js"
import { BadRequestMsgError, NotFoundError } from "../core/ApiError.js"

import facilityStaffServices from "../services/facilityStaff.services.js"
import userServices from "../services/user.services.js"
import { UserRole, ActivityAction } from "../../generated/prisma/index.js"
import { assertFacilityAccess } from "../utils/facilityUtils.js"
import { logActivity } from "../utils/activityUtils.js"

export const handleGetFacilityStaffs = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  if (!facilityId) {
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

// Assign, or transfer if the staff already belongs to another facility.
export const handleAssignStaff = async (req: Request, res: Response) => {
  const userId = req.params.userId as string
  if (!userId) {
    throw new BadRequestMsgError("'userId' is required as a parameter.")
  }

  const user = await userServices.findById(userId)
  if (!user) {
    throw new NotFoundError("User not found.")
  }

  if (user.role !== UserRole.FACILITY_STAFF) {
    throw new BadRequestMsgError("Only facility staff users can be assigned to a facility.")
  }

  const facilityId = req.params.facilityId as string
  const facility = await assertFacilityAccess(req, facilityId)

  const isAlreadyMember = await facilityStaffServices.findStaff(facilityId, userId)
  if (isAlreadyMember) {
    throw new BadRequestMsgError("This staff is already part of this facility.")
  }

  const currentMembership = await facilityStaffServices.findMembershipByUserId(userId)
  if (currentMembership) {
    await facilityStaffServices.transferStaff(userId, facilityId)

    await logActivity(req, ActivityAction.STAFF_ASSIGNED, {
      facility: { id: facility.id, name: facility.name },
      target: { id: user.id, label: `${user.firstName} ${user.lastName}`.trim() || user.email },
      metadata: { transferredFrom: currentMembership.facility.name }
    })

    return new SuccessMsgResponse(`${user.firstName} ${user.lastName} has been transferred from facility ${currentMembership.facility.name} to facility ${facility.name}.`).send(res)
  }

  await facilityStaffServices.create(facilityId, userId)

  await logActivity(req, ActivityAction.STAFF_ASSIGNED, {
    facility: { id: facility.id, name: facility.name },
    target: { id: user.id, label: `${user.firstName} ${user.lastName}`.trim() || user.email }
  })

  return new SuccessMsgResponse(`${user.firstName} ${user.lastName} is now a staff of facility ${facility.name}.`).send(res)
}

export const handleDismissStaff = async (req: Request, res: Response) => {
  const userId = req.params.userId as string
  if (!userId) {
    throw new BadRequestMsgError("'userId' is required as a parameter.")
  }

  const user = await userServices.findById(userId)
  if (!user) {
    throw new NotFoundError("User not found.")
  }

  const facilityId = req.params.facilityId as string
  const facility = await assertFacilityAccess(req, facilityId)

  const isMember = await facilityStaffServices.findStaff(facilityId, userId)
  if (!isMember) {
    throw new BadRequestMsgError("This staff is not part of this facility.")
  }

  await facilityStaffServices.deleteStaff(facilityId, userId)

  await logActivity(req, ActivityAction.STAFF_DISMISSED, {
    facility: { id: facility.id, name: facility.name },
    target: { id: user.id, label: `${user.firstName} ${user.lastName}`.trim() || user.email }
  })

  return new SuccessMsgResponse(`${user.firstName} ${user.lastName} has been removed as a staff of facility ${facility.name}.`).send(res)
}
