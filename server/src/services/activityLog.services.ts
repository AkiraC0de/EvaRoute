import prisma from "../lib/prisma"
import { ActivityAction, Prisma, UserRole } from "../../generated/prisma"

/**
 * Activity log storage — append-only. Rows are created at mutation points
 * (no write API, no update/delete paths) and read back through
 * GET /api/v1/activity. Actor/facility name snapshots are denormalized so
 * entries stay readable after the referenced records are deleted.
 */

export type ActivityInput = {
  action: ActivityAction
  actor: {
    id?: string | null
    email: string
    name?: string | null
    role: UserRole
  }
  facility?: { id: string; name: string } | null
  target?: { id?: string; label?: string } | null
  metadata?: Prisma.InputJsonValue
}

/**
 * Best-effort write: a failure here is logged to the server console but
 * NEVER thrown — an audit hiccup must not fail a business mutation that
 * already succeeded (see the plan's tradeoff note).
 */
const record = async (input: ActivityInput) => {
  try {
    return await prisma.activityLog.create({
      data: {
        action: input.action,
        actorId: input.actor.id ?? null,
        actorEmail: input.actor.email,
        actorName: input.actor.name ?? null,
        actorRole: input.actor.role,
        facilityId: input.facility?.id ?? null,
        facilityName: input.facility?.name ?? null,
        targetId: input.target?.id ?? null,
        targetLabel: input.target?.label ?? null,
        metadata: input.metadata
      }
    })
  } catch (error) {
    console.error("[activityLog] failed to record", input.action, error)
    return null
  }
}

export type ActivityListQuery = {
  facilityId?: string
  actions?: ActivityAction[]
  actorId?: string
  search?: string
  from?: Date
  to?: Date
  cursor?: string
  page?: number
  limit?: number
}

/** Shared WHERE builder for the feed and the stats aggregation. */
const buildWhere = (query: ActivityListQuery) => ({
  ...(query.facilityId ? { facilityId: query.facilityId } : {}),
  ...(query.actions && query.actions.length > 0 ? { action: { in: query.actions } } : {}),
  ...(query.actorId ? { actorId: query.actorId } : {}),
  ...(query.search
    ? {
        OR: [
          { targetLabel: { contains: query.search, mode: "insensitive" as const } },
          { actorName: { contains: query.search, mode: "insensitive" as const } },
          { actorEmail: { contains: query.search, mode: "insensitive" as const } },
          { facilityName: { contains: query.search, mode: "insensitive" as const } }
        ]
      }
    : {}),
  ...(query.from || query.to
    ? {
        createdAt: {
          ...(query.from ? { gte: query.from } : {}),
          ...(query.to ? { lte: query.to } : {})
        }
      }
    : {})
})

/**
 * Page of activity + the accurate total for the current filter set.
 *
 * Two modes share one query shape:
 *   cursor mode (`cursor` given / no `page`) — keyset pagination for compact
 *     strips; `rows` comes back limit+1 so the caller can detect a next page.
 *   page mode (`page` given) — offset pagination for numbered page controls;
 *     `total` drives totalPages, so a COUNT runs alongside the fetch.
 *
 * Ordering gets an `id` tiebreaker so offset pages are stable even when
 * several rows share a createdAt.
 */
const findMany = async (query: ActivityListQuery) => {
  const limit = query.limit ?? 20
  const where = buildWhere(query)
  const pageMode = query.page !== undefined

  const [total, rows] = await Promise.all([
    pageMode ? prisma.activityLog.count({ where }) : Promise.resolve(0),
    prisma.activityLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      ...(query.cursor
        ? { cursor: { id: query.cursor }, skip: 1, take: limit + 1 }
        : { skip: pageMode ? (query.page! - 1) * limit : 0, take: pageMode ? limit : limit + 1 })
    })
  ])

  return { rows, total }
}

/**
 * Accurate per-action counts over a period (single GROUP BY) — powers the
 * dashboard summary metrics. Never derive "totals" by counting a page of
 * results; this is the only interpretation the API guarantees.
 */
const countByAction = (query: Omit<ActivityListQuery, "cursor" | "limit">) =>
  prisma.activityLog.groupBy({
    by: ["action"],
    where: buildWhere(query),
    _count: { _all: true }
  })

export default {
  record,
  findMany,
  countByAction
}
