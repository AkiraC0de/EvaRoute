import { Request } from "express"
import { ActivityAction, Prisma, UserRole } from "../../generated/prisma/index.js"
import { requireAuth } from "./authUtils.js"
import userServices from "../services/user.services.js"
import activityLogServices from "../services/activityLog.services.js"

/**
 * One-call activity logging for mutation handlers.
 *
 *   await logActivity(req, ActivityAction.FACILITY_DELETED, {
 *     facility: { id, name },
 *     target: { id, label },
 *     metadata: { ... }
 *   })
 *
 * The actor is resolved from the request's auth context (plus a user lookup
 * for the name/email snapshot) unless the caller already has the row and
 * passes `actor`. Entirely best-effort: any failure is swallowed so it can
 * never break the business operation being audited.
 */
export const logActivity = async (
  req: Request,
  action: ActivityAction,
  opts?: {
    actor?: { id?: string | null; email: string; name?: string | null; role: UserRole }
    facility?: { id: string; name: string } | null
    target?: { id?: string; label?: string } | null
    metadata?: Prisma.InputJsonValue
  }
) => {
  try {
    let actor = opts?.actor

    if (!actor) {
      const { userId, role } = requireAuth(req)
      const user = await userServices.findById(userId)
      actor = {
        id: userId,
        email: user?.email ?? "unknown",
        name: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null : null,
        role
      }
    }

    await activityLogServices.record({
      action,
      actor,
      facility: opts?.facility ?? null,
      target: opts?.target ?? null,
      metadata: opts?.metadata
    })
  } catch (error) {
    console.error("[activityLog] failed to record", action, error)
  }
}
