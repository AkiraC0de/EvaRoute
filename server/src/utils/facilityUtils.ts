import { Prisma } from "../../generated/prisma"
import { UserRole } from "../../generated/prisma"

import facilityServices from "../services/facility.services"
import facilityStaffServices from "../services/facilityStaff.services"
import { ForbiddenError, NotFoundError } from "../core/ApiError"
import { requireAuth } from "./authUtils"
import { Request } from "express"

export type FacilityEntity = Prisma.FacilityGetPayload<Record<string, never>>

export const toFacilityDTO = (f: FacilityEntity) => ({
  id: f.id,
  name: f.name,
  address: f.address,
  note: f.note,
  maxCapacity: f.maxCapacity,
  status: f.status,
  latitude: f.latitude,
  longitude: f.longitude,
  createdAt: f.createdAt,
})

// Shared access check: admin may access any facility; staff only their own.
export const assertFacilityAccess = async (req: Request, facilityId: string) => {
  const { userId, role } = requireAuth(req)

  const facility = await facilityServices.findById(facilityId)
  if(!facility){
    throw new NotFoundError('Facility not found.')
  }

  if (role !== UserRole.ADMIN) {
    const isMember = await facilityStaffServices.findStaff(facilityId, userId)
    if(!isMember){
      throw new ForbiddenError('You are not part of this facility.')
    }
  }

  return facility
}

export const toStaffDTO = (user: {
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