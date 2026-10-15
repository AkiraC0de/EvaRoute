import { Request, Response } from 'express'
import { validateData, paramErr } from '../utils/validatorUtils'
import { checkInSchema, getStaysQuerySchema } from '../validations/facilityStay.validations'

import facilityStayServices from '../services/facilityStay.services'
import { SuccessMsgResponse, SuccessResponse } from '../core/ApiResponse'
import { BadRequestMsgError, NotFoundError } from '../core/ApiError'
import { assertFacilityAccess } from '../utils/facilityUtils'
import { ActivityAction } from '../../generated/prisma'
import { logActivity } from '../utils/activityUtils'

// GET /facility/:facilityId/stay?status=ACTIVE|CHECKED_OUT
export const handleGetStays = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  if(!facilityId){
    throw new BadRequestMsgError(paramErr(['facilityId']))
  }

  const facility = await assertFacilityAccess(req, facilityId)
  const { status } = validateData<typeof getStaysQuerySchema>(getStaysQuerySchema, req.query, 'query')

  const stays = await facilityStayServices.findByFacilityId(facilityId, status)

  return new SuccessResponse(
    `Stays of facility ${facility.name}.`,
    { stays, count: stays.length }
  ).send(res)
}

// GET /facility/:facilityId/stay/occupancy
export const handleGetOccupancy = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  if(!facilityId){
    throw new BadRequestMsgError(paramErr(['facilityId']))
  }

  const facility = await assertFacilityAccess(req, facilityId)

  const occupancy = await facilityStayServices.getOccupancy(facilityId)

  return new SuccessResponse(
    `Occupancy of facility ${facility.name}.`,
    {
      maxCapacity: facility.maxCapacity,
      ...occupancy,
      remaining: Math.max(0, facility.maxCapacity - occupancy.members)
    }
  ).send(res)
}

// GET /facility/:facilityId/stay/:stayId
export const handleGetStay = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  const stayId = req.params.stayId as string
  if(!facilityId || !stayId){
    throw new BadRequestMsgError(paramErr(['facilityId', 'stayId']))
  }

  await assertFacilityAccess(req, facilityId)

  const stay = await facilityStayServices.findById(stayId)
  if(!stay || stay.facilityId !== facilityId){
    throw new NotFoundError('Stay not found.')
  }

  return new SuccessResponse('Stay fetched.', { stay }).send(res)
}

// POST /facility/:facilityId/stay — check in a family with its members
export const handleCheckIn = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  if(!facilityId){
    throw new BadRequestMsgError(paramErr(['facilityId']))
  }

  const facility = await assertFacilityAccess(req, facilityId)

  const data = validateData<typeof checkInSchema>(checkInSchema, req.body)

  // Capacity guard: the whole family must fit in the remaining slots
  const activeMembers = await facilityStayServices.countActiveMembers(facilityId)
  const remaining = facility.maxCapacity - activeMembers
  if(data.members.length > remaining){
    throw new BadRequestMsgError(
      `Not enough capacity for this household. Only ${remaining} slot${remaining === 1 ? '' : 's'} left in facility ${facility.name}.`
    )
  }

  const stay = await facilityStayServices.create({
    familyName: data.familyName,
    facility: { connect: { id: facilityId } },
    members: {
      create: data.members.map(member => ({
        fullName: member.fullName,
        ageGroup: member.ageGroup
      }))
    }
  })

  // Member names are NOT duplicated into the log (PII minimization) — the
  // stay record is the source of truth; the log keeps counts only.
  await logActivity(req, ActivityAction.STAY_CHECKED_IN, {
    facility: { id: facility.id, name: facility.name },
    target: { id: stay.id, label: data.familyName },
    metadata: {
      stayId: stay.id,
      familyName: data.familyName,
      members: data.members.length,
      adults: data.members.filter(m => m.ageGroup === "ADULT").length,
      children: data.members.filter(m => m.ageGroup === "CHILD").length
    }
  })

  return new SuccessResponse(
    `Family ${data.familyName} has been checked in to facility ${facility.name}.`,
    { stay }
  ).send(res)
}

// POST /facility/:facilityId/stay/:stayId/checkout
export const handleCheckOut = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  const stayId = req.params.stayId as string
  if(!facilityId || !stayId){
    throw new BadRequestMsgError(paramErr(['facilityId', 'stayId']))
  }

  const facility = await assertFacilityAccess(req, facilityId)

  const stay = await facilityStayServices.findById(stayId)
  if(!stay || stay.facilityId !== facilityId){
    throw new NotFoundError('Stay not found.')
  }

  if(stay.checkedOutAt !== null){
    throw new BadRequestMsgError(`Family ${stay.familyName} has already checked out.`)
  }

  await facilityStayServices.checkOut(stayId)

  const durationMs = stay.checkedInAt ? Date.now() - stay.checkedInAt.getTime() : null

  await logActivity(req, ActivityAction.STAY_CHECKED_OUT, {
    facility: { id: facility.id, name: facility.name },
    target: { id: stay.id, label: stay.familyName },
    metadata: {
      stayId: stay.id,
      familyName: stay.familyName,
      durationMinutes: durationMs !== null ? Math.round(durationMs / 60000) : null
    }
  })

  return new SuccessMsgResponse(
    `Family ${stay.familyName} has checked out from facility ${stay.facility.name}.`
  ).send(res)
}
