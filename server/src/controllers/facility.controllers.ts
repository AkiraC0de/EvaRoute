import { Request, Response } from "express"
import { validateData, parseUuidParam } from "../utils/validatorUtils.js"
import prisma from "../lib/prisma.js"
import { bulkToggleFacilitySchema, getFacilityQuerySchema, patchFacilitySchema, registerFacilitySchema } from "../validations/facility.validations.js"

import facilityServices from "../services/facility.services.js"
import facilityResourceServices from "../services/facilityResource.services.js"
import userServices from "../services/user.services.js"
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
  // Under concurrent registration a P2002 on the coordinate unique can still
  // surface past the pre-check — map it to a friendly 400 instead of a 500.
  const createdFacility = await facilityServices.create(facilityData, resources).catch((err: { code?: string }) => {
    if (err?.code === "P2002") {
      throw new BadRequestMsgError("Another active facility already exists at this location.")
    }
    throw err
  })

  await logActivity(req, ActivityAction.FACILITY_CREATED, {
    facility: { id: createdFacility.id, name: createdFacility.name },
    target: { id: createdFacility.id, label: createdFacility.name },
    metadata: { maxCapacity: createdFacility.maxCapacity }
  })

  // Return the CREATED entity — id, persisted fields (including defaults like
  // `status`) and the created essential resources — not the request echo,
  // which carried neither the id nor the persisted state.
  const createdEssentials = await facilityResourceServices.findByFacilityId(createdFacility.id)

  return new SuccessResponse(
    `New facility named ${facilityData.name} has been registered.`,
    { ...createdFacility, resources: createdEssentials }
  ).send(res)
}

export const handleDeleteFacility = async (req: Request, res: Response) => {
  const facilityId = parseUuidParam(req.params.facilityId, "facilityId")

  // Toggle: if the facility is soft-deleted, DELETE restores it.
  const deletedFacility = await facilityServices.findDeletedById(facilityId)
  if(deletedFacility){
    // A soft-deleted facility's coordinates may have been taken by a new (active) facility meanwhile.
    const conflicting = await facilityServices.findByLongLat([
      Number(deletedFacility.longitude),
      Number(deletedFacility.latitude)
    ], deletedFacility.id)
    if (conflicting) {
      throw new BadRequestMsgError(`Cannot restore facility ${deletedFacility.name}: its location is now occupied by facility ${conflicting.name}. Update its coordinates first.`)
    }

    await facilityServices.restoreById(facilityId).catch((err: { code?: string }) => {
      if (err?.code === "P2002") {
        throw new BadRequestMsgError("Another active facility already exists at this location.")
      }
      throw err
    })
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

  const deletedNow = await facilityServices.softDeleteById(facilityId)
  if (!deletedNow) {
    throw new BadRequestMsgError("Facility changed state while processing.")
  }

  await logActivity(req, ActivityAction.FACILITY_DELETED, {
    facility: { id: facility.id, name: facility.name },
    target: { id: facility.id, label: facility.name }
  })

  return new SuccessMsgResponse(`Facility ${facility.name} has been deleted.`).send(res)
}

export const handlePatchFacility = async (req: Request, res: Response) => {
  const facilityId = parseUuidParam(req.params.facilityId, "facilityId")

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

  const updatedFacility = await facilityServices.update(facilityId, data).catch((err: { code?: string }) => {
    if (err?.code === "P2002") {
      throw new BadRequestMsgError("Another active facility already exists at this location.")
    }
    throw err
  })

    // Log only the fields that actually changed (small diffs keep the log lean).
    // Values are normalized to plain JSON first: Prisma.Decimal (coordinates)
    // and Date are NOT JSON values — copying them raw can fail serialization,
    // and logActivity swallows failures, silently losing the audit entry.
    const toPlainJson = (value: unknown): Prisma.InputJsonValue =>
      (typeof value === "object" && value !== null ? String(value) : value) as Prisma.InputJsonValue
    const before: Prisma.InputJsonValue = {}
    const after: Prisma.InputJsonValue = {}
    for (const key of Object.keys(data) as (keyof typeof data)[]) {
      ;(before as Record<string, unknown>)[key] = toPlainJson((facility as Record<string, unknown>)[key])
      ;(after as Record<string, unknown>)[key] = toPlainJson(data[key])
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
 * only; every candidate runs the SAME guards as the single-item paths and is
 * skipped with a reason when a guard fails, one activity entry per affected
 * facility so the audit log stays exact.
 */
export const handleBulkToggleFacilities = async (req: Request, res: Response) => {
  const { ids, deleted } = validateData<typeof bulkToggleFacilitySchema>(
    bulkToggleFacilitySchema,
    req.body,
    "body"
  )

  const affected = await prisma.facility.findMany({
    where: { id: { in: ids }, ...(deleted ? { deletedAt: null } : { deletedAt: { not: null } }) },
    select: { id: true, name: true, longitude: true, latitude: true }
  })
  if (affected.length === 0) {
    return new SuccessMsgResponse("No facilities needed the change.").send(res)
  }

  const results: {
    id: string
    name: string
    status: "deleted" | "restored" | "skipped"
    reason?: string
  }[] = []

  // Resolve the actor ONCE and hand it to every logActivity below — otherwise
  // the loop pays a user lookup per affected facility (2N round trips just to
  // write N audit rows).
  const { userId: actorId, role: actorRole } = requireAuth(req)
  const actorUser = await userServices.findByIdSafe(actorId)
  const actor = {
    id: actorId,
    email: actorUser?.email ?? "unknown",
    name: actorUser ? `${actorUser.firstName ?? ""} ${actorUser.lastName ?? ""}`.trim() || null : null,
    role: actorRole
  }

  for (const facility of affected) {
    if (deleted) {
      // Occupancy guard (same as the single delete): evacuees must be gone.
      const checkedInCount = await facilityServices.countCheckedInStays(facility.id)
      if (checkedInCount > 0) {
        results.push({
          id: facility.id,
          name: facility.name,
          status: "skipped",
          reason: "Cannot delete a facility with checked-in evacuees. Please check them out first."
        })
        continue
      }
    } else {
      // Restore guard (same as the single restore): another ACTIVE facility
      // may occupy the location while this one was soft-deleted.
      const conflicting = await facilityServices.findByLongLat([
        Number(facility.longitude),
        Number(facility.latitude)
      ], facility.id)
      if (conflicting) {
        results.push({
          id: facility.id,
          name: facility.name,
          status: "skipped",
          reason: `Cannot restore facility ${facility.name}: its location is now occupied by facility ${conflicting.name}. Update its coordinates first.`
        })
        continue
      }
    }

    // Conditional toggle: only flips rows still in the expected state.
    let toggled: { count: number }
    try {
      if (deleted) {
        // Atomic locked delete — the occupancy guard re-checks INSIDE the
        // facility row lock (same guard semantics as the single delete path).
        const done = await facilityServices.softDeleteById(facility.id)
        toggled = { count: done ? 1 : 0 }
      } else {
        toggled = await facilityServices.toggleDeletedById(facility.id, deleted)
      }
    } catch (err) {
      if (err instanceof BadRequestMsgError) {
        results.push({
          id: facility.id,
          name: facility.name,
          status: "skipped",
          reason: err.message
        })
        continue
      }
      if ((err as { code?: string })?.code === "P2002") {
        results.push({
          id: facility.id,
          name: facility.name,
          status: "skipped",
          reason: "Another active facility already exists at this location."
        })
        continue
      }
      throw err
    }
    if (toggled.count === 0) {
      results.push({
        id: facility.id,
        name: facility.name,
        status: "skipped",
        reason: "Facility changed state while processing."
      })
      continue
    }

    results.push({ id: facility.id, name: facility.name, status: deleted ? "deleted" : "restored" })

    await logActivity(req, deleted ? ActivityAction.FACILITY_DELETED : ActivityAction.FACILITY_RESTORED, {
      actor,
      facility: { id: facility.id, name: facility.name },
      target: { id: facility.id, label: facility.name }
    })
  }

  const changed = results.filter((result) => result.status !== "skipped").length

  return new SuccessResponse(
    `${changed} ${changed === 1 ? "facility" : "facilities"} ${deleted ? "deleted" : "restored"}.`,
    { results }
  ).send(res)
}
