import { Request, Response } from "express"
import { validateData } from "../utils/validatorUtils"
import { getDashboardSummaryQuerySchema } from "../validations/dashboard.validations"
import { SuccessResponse } from "../core/ApiResponse"
import { ForbiddenError } from "../core/ApiError"
import { requireAuth } from "../utils/authUtils"
import facilityStaffServices from "../services/facilityStaff.services"
import dashboardServices from "../services/dashboard.services"
import { UserRole } from "../../generated/prisma"

/**
 * GET /api/v1/dashboard/summary — one aggregate for the admin Overview:
 * facility states, live occupancy, staff states, rolling activity windows and
 * per-facility load. Scoping mirrors the activity reads: ADMIN sees the
 * network (optional facilityId filter), FACILITY_STAFF is forced to their own
 * facility.
 */
export const handleGetDashboardSummary = async (req: Request, res: Response) => {
  const query = validateData<typeof getDashboardSummaryQuerySchema>(
    getDashboardSummaryQuerySchema,
    req.query,
    "query"
  )
  const { userId, role } = requireAuth(req)

  let facilityId = query.facilityId
  if (role === UserRole.FACILITY_STAFF) {
    const membership = await facilityStaffServices.findMembershipByUserId(userId)
    if (!membership) {
      // Not attached to any facility — an empty summary, never someone else's.
      return new SuccessResponse("Dashboard summary fetched.", {
        scope: "empty",
        facilities: { total: 0, byStatus: {}, deleted: 0 },
        capacity: { total: 0, occupied: 0, pct: 0 },
        occupants: { total: 0, children: 0, adults: 0, families: 0 },
        staff: { total: 0, active: 0, disabled: 0, unassigned: 0 },
        activity: { last24h: { checkIns: 0, checkOuts: 0 }, last7d: { events: 0 } },
        facilityLoad: []
      }).send(res)
    }
    if (facilityId && facilityId !== membership.facilityId) {
      throw new ForbiddenError("You can only view dashboard data for your own facility.")
    }
    facilityId = membership.facilityId
  }

  const summary = await dashboardServices.getSummary(facilityId)
  return new SuccessResponse("Dashboard summary fetched.", summary).send(res)
}
