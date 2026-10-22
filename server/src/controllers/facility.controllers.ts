import { Request, Response } from "express"
import { validateData } from "../utils/validatorUtils.js"
import prisma from "../lib/prisma.js"
import { bulkToggleFacilitySchema, getFacilityQuerySchema, patchFacilitySchema, registerFacilitySchema } from "../validations/facility.validations.js"

import facilityServices from "../services/facility.services.js"
import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse.js"
import { BadRequestMsgError, ForbiddenError, NotFoundError } from "../core/ApiError.js"
import { UserRole, ActivityAction, Prisma } from "../../generated/prisma/index.js"
import facilityStaffServices from "../services/facilityStaff.services.js"
import { requireAuth } from "../utils/authUtils.js"
import { assertFacilityAccess, toFacilityDTO } from "../utils/facilityUtils.js"
import { logActivity } from "../utils/activityUtils.js"

export const handleGetFacility = async (req: Request, res: Response) => {
  const { role } = requireAuth(req)
  const { status, deleted } = validateData<typeof getFacilityQuerySchema>(getFacilityQuerySchema, req.query, "query")

  // Soft-deleted listing is an ADMIN concern (it feeds the restore flow).
  const registry = validateData<typeof getFacilityQuerySchema>(getFacilityQuerySchema, req.query, "query")
  if (deleted && role !== UserRole.ADMIN) {
    throw new ForbiddenError()
  }

  switch (role){
    case UserRole.ADMIN:
      return handleAdminGetFacility(res, status, deleted, registry)

    case UserRole.FACILITY_STAFF:
      return handleStaffGetFacility(req, res, status)

    default:
      throw new ForbiddenError()
  }
}

// Staff: ONLY the facility assigned to them (a staff can be assigned to ONE facility)
const handleStaffGetFacility = async (req: Request, res: Response, status?: "AVAILABLE" | "UNAVAILABLE") => {
  const { userId } = requireAuth(req)
  const membership = await facilityStaffServices.findMembershipByUserId(userId)

  if (!membership || membership.facility.deletedAt !== null) {
    return new SuccessResponse("You are not assigned to any facility.", { facility: null }).send(res)
  }

  const facility = toFacilityDTO(membership.facility)
  if (status && facility.status !== status) {
    return new SuccessResponse("You are not assigned to any facility.", { facility: null }).send(res)
  }

  return new SuccessResponse("Your assigned facility.", { facility }).send(res)
}

// Admin: ALL facilities (soft-deleted included only on request)
const handleAdminGetFacility = async (
  res: Response,
  status?: "AVAILABLE" | "UNAVAILABLE",
  deleted?: boolean,
  registry?: { q?: string; sort?: "name" | "capacity" | "staff" | "created"; order?: "asc" | "desc"; page?: number; pageSize?: number }
) => {
  // Registry mode (search/sort/pagination present): answer with the paged
  // envelope. Legacy mode: the bare array every older caller expects.
  const wantsPaged = Boolean(
    registry && (registry.q || registry.sort || registry.order || registry.page || registry.pageSize)
  )
  if (wantsPaged) {
    const result = await facilityServices.findManyPaged({
      status,
      deleted,
      q: registry!.q,
      sort: registry!.sort,
      order: registry!.order,
      page: registry!.page,
      pageSize: registry!.pageSize
    })
    return new SuccessResponse("Facilities fetched.", result).send(res)
  }
  const facilities = await facilityServices.findMany(status, deleted)
  const formatedFacilities = facilities.map(f => ({
    ...toFacilityDTO(f),
    staffCount: f._count.staff
  }))

  return new SuccessResponse("All facilities fetched.",{ facilities: formatedFacilities, count: formatedFacilities.length }).send(res)
}

export const handleRegisterFacility = async (req: Request, res: Response) => {
  const { resources, ...facilityData } = validateData<typeof registerFacilitySchema>(registerFacilitySchema, req.body)

  const facilityExistOnLocation = await facilityServices.findByLongLat([facilityData.longitude, facilityData.latitude])
  if(facilityExistOnLocation){
    throw new BadRequestMsgError("There is an existing facility on the location. Please select a new location point")
  }
  
  // Atomic: the facility + its three essential resources commit together.
  const createdFacility = await facilityServices.create(facilityData, resources)

  await logActivity(req, ActivityAction.FACILITY_CREATED, {
    facility: { id: createdFacility.id, name: createdFacility.name },
    target: { id: createdFacility.id, label: createdFacility.name },
    metadata: { maxCapacity: createdFacility.maxCapacity }
  })

  return new SuccessResponse(`New facility named ${facilityData.name} has been registered.`, facilityData).send(res)
}

export const handleDeleteFacility = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  if(!facilityId){
    throw new BadRequestMsgError("facilityId is required as parameter.")
  }

  // Toggle: if the facility is soft-deleted, DELETE restores it.
  const deletedFacility = await facilityServices.findDeletedById(facilityId)
  if(deletedFacility){
    // A soft-deleted facility's coordinates may have been taken by a new facility meanwhile.
    const conflicting = await facilityServices.findByLongLat([
      Number(deletedFacility.longitude),
      Number(deletedFacility.latitude)
    ])
    if (conflicting) {
      throw new BadRequestMsgError(`Cannot restore facility ${deletedFacility.name}: its location is now occupied by facility ${conflicting.name}. Update its coordinates first.`)
    }

    await facilityServices.restoreById(facilityId)
    await logActivity(req, ActivityAction.FACILITY_RESTORED, {
      facility: { id: deletedFacility.id, name: deletedFacility.name },
      target: { id: deletedFacility.id, label: deletedFacility.name }
    })
    return new SuccessMsgResponse(`Facility ${deletedFacility.name} has been restored.`).send(res)
  }

  const facility = await facilityServices.findById(facilityId)
  if(!facility){
    throw new NotFoundError("Facility not found.")
  }

  // Occupancy guard: cannot delete while evacuees are checked in.
  const checkedInCount = await facilityServices.countCheckedInStays(facilityId)
  if(checkedInCount > 0){
    throw new BadRequestMsgError("Cannot delete a facility with checked-in evacuees. Please check them out first.")
  }

  await facilityServices.softDeleteById(facilityId)

  await logActivity(req, ActivityAction.FACILITY_DELETED, {
    facility: { id: facility.id, name: facility.name },
    target: { id: facility.id, label: facility.name }
  })

  return new SuccessMsgResponse(`Facility ${facility.name} has been deleted.`).send(res)
}

export const handlePatchFacility = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  if(!facilityId){
    throw new BadRequestMsgError("facilityId is required as parameter.")
  }

  const facility = await assertFacilityAccess(req, facilityId)

  const data = validateData<typeof patchFacilitySchema>(patchFacilitySchema, req.body)

  // Coordinate-conflict guard: reject early instead of letting Prisma's P2002 become a 500.
  const effectiveLongitude = data.longitude ?? Number(facility.longitude)
  const effectiveLatitude = data.latitude ?? Number(facility.latitude)
  if (
    data.longitude !== undefined ||
    data.latitude !== undefined
  ) {
    const conflicting = await facilityServices.findByLongLat([effectiveLongitude, effectiveLatitude])
    if (conflicting && conflicting.id !== facilityId) {
      throw new BadRequestMsgError("There is an existing facility on this location. Please select a new location point.")
    }
  }

  const updatedFacility = await facilityServices.update(facilityId, data)

    // Log only the fields that actually changed (small diffs keep the log lean).
    const before: Prisma.InputJsonValue = {}
    const after: Prisma.InputJsonValue = {}
    for (const key of Object.keys(data) as (keyof typeof data)[]) {
      ;(before as Record<string, unknown>)[key] = (facility as Record<string, unknown>)[key]
      ;(after as Record<string, unknown>)[key] = data[key]
    }

    await logActivity(req, ActivityAction.FACILITY_UPDATED, {
      facility: { id: facility.id, name: facility.name },
      target: { id: facility.id, label: facility.name },
      metadata: { before, after }
    })

    return new SuccessResponse(`${facility.name} has been patched.`, updatedFacility).send(res)
}

/**
 * POST /facility/bulk-toggle — bulk soft-delete or restore (the same toggle
 * semantics as the single DELETE route, for registry bulk actions). ADMIN
 * only; one activity entry per affected facility so the audit log stays exact.
 */
export const handleBulkToggleFacilities = async (req: Request, res: Response) => {
  const { ids, deleted } = validateData<typeof bulkToggleFacilitySchema>(
    bulkToggleFacilitySchema,
    req.body,
    "body"
  )

  const affected = await prisma.facility.findMany({
    where: { id: { in: ids }, ...(deleted ? { deletedAt: null } : { deletedAt: { not: null } }) },
    select: { id: true, name: true }
  })
  if (affected.length === 0) {
    return new SuccessMsgResponse("No facilities needed the change.").send(res)
  }

  await facilityServices.bulkToggleDeleted(affected.map((f: { id: string }) => f.id), deleted)

  for (const facility of affected) {
    await logActivity(req, deleted ? ActivityAction.FACILITY_DELETED : ActivityAction.FACILITY_RESTORED, {
      facility: { id: facility.id, name: facility.name },
      target: { id: facility.id, label: facility.name }
    })
  }

  return new SuccessMsgResponse(
    `${affected.length} ${affected.length === 1 ? "facility" : "facilities"} ${deleted ? "deleted" : "restored"}.`
  ).send(res)
}
