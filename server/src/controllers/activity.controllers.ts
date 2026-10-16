import { Request, Response } from "express"
import { validateData } from "../utils/validatorUtils.js"
import { getActivityQuerySchema, getActivityStatsQuerySchema } from "../validations/activity.validations.js"
import { SuccessResponse } from "../core/ApiResponse.js"
import { ForbiddenError } from "../core/ApiError.js"
import { requireAuth } from "../utils/authUtils.js"
import facilityStaffServices from "../services/facilityStaff.services.js"
import activityLogServices from "../services/activityLog.services.js"
import { ActivityAction, UserRole } from "../../generated/prisma/index.js"

/**
 * Shared role scoping for every activity read:
 * ADMIN sees everything (optional facilityId filter); FACILITY_STAFF is
 * forced to their own facility (mirror of handleGetFacility). Returns the
 * effective facilityId, or null when the feed should be empty.
 */
const resolveScope = async (
  req: Request,
  requestedFacilityId?: string
): Promise<{ facilityId?: string; empty?: boolean }> => {
  const { userId, role } = requireAuth(req)

  if (role !== UserRole.FACILITY_STAFF) {
    return { facilityId: requestedFacilityId }
  }

  const membership = await facilityStaffServices.findMembershipByUserId(userId)
  if (!membership) {
    return { empty: true }
  }
  if (requestedFacilityId && requestedFacilityId !== membership.facilityId) {
    throw new ForbiddenError("You can only view activity for your own facility.")
  }
  return { facilityId: membership.facilityId }
}

// GET /api/v1/activity — newest-first, cursor-paginated activity feed.
// ADMIN sees everything (optional facilityId filter). FACILITY_STAFF is
// scoped server-side to their own facility (mirrors handleGetFacility).
export const handleGetActivities = async (req: Request, res: Response) => {
  const query = validateData<typeof getActivityQuerySchema>(getActivityQuerySchema, req.query, "query")
  const scope = await resolveScope(req, query.facilityId)

  if (scope.empty) {
    // Not attached to any facility — their scope is empty, so is the feed.
    return new SuccessResponse("Activity fetched.", {
      activities: [],
      nextCursor: null
    }).send(res)
  }

  const limit = query.limit ?? 20
  const { rows, total } = await activityLogServices.findMany({
    facilityId: scope.facilityId,
    actions: query.action,
    actorId: query.actorId,
    search: query.search,
    from: query.from,
    to: query.to,
    cursor: query.cursor,
    page: query.page,
    limit
  })

  const pageMode = query.page !== undefined
  const page = query.page ?? 1
  const hasMore = rows.length > limit
  const activities = rows.slice(0, limit)
  const nextCursor = hasMore ? activities[activities.length - 1].id : null

  return new SuccessResponse("Activity fetched.", {
    activities,
    nextCursor,
    // Offset-mode metadata (null in cursor mode — no COUNT ran)
    total: pageMode ? total : null,
    page,
    pageSize: limit,
    totalPages: pageMode ? Math.max(1, Math.ceil(total / limit)) : null
  }).send(res)
}

// GET /api/v1/activity/stats — accurate counts grouped by action over a
// period (default: last 7 days). Powers dashboard summary metrics; totals
// come from a DB GROUP BY, never from counting feed rows.
export const handleGetActivityStats = async (req: Request, res: Response) => {
  const query = validateData<typeof getActivityStatsQuerySchema>(getActivityStatsQuerySchema, req.query, "query")
  const scope = await resolveScope(req)

  const until = query.to ?? new Date()
  let since = query.from ?? new Date(until.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Day-bucketed timelines are capped at 31 days so a bad query can never
  // pull an unbounded scan into the bucketing step.
  const maxWindow = 31 * 24 * 60 * 60 * 1000
  if (query.interval === "day" && until.getTime() - since.getTime() > maxWindow) {
    since = new Date(until.getTime() - maxWindow)
  }

  if (scope.empty) {
    return new SuccessResponse("Activity stats fetched.", {
      total: 0,
      byAction: {},
      ...(query.interval === "day" ? { timeline: [] } : {}),
      since,
      until
    }).send(res)
  }

  const groups = await activityLogServices.countByAction({
    facilityId: scope.facilityId,
    from: since,
    to: until
  })

  const byAction: Partial<Record<ActivityAction, number>> = {}
  let total = 0
  for (const group of groups) {
    byAction[group.action] = group._count._all
    total += group._count._all
  }

  const timeline = query.interval === "day"
    ? await activityLogServices.countByDay({
        facilityId: scope.facilityId,
        from: since,
        to: until
      })
    : undefined

  return new SuccessResponse("Activity stats fetched.", {
    total,
    byAction,
    ...(timeline ? { timeline } : {}),
    since,
    until
  }).send(res)
}
