import { EssentialResourceType, FacilityStatus, Prisma } from "../../generated/prisma/index.js"
import prisma from "../lib/prisma.js"
import { ESSENTIAL_RESOURCES } from "../utils/essentialResources.js"

const findById = (facilityId: string) => {
  return prisma.facility.findFirst({
    where: {
      id: facilityId,
      deletedAt: null
    }
  })
}

const findByLongLat = (location: [longitude: number, latitude: number] ) => {
  return prisma.facility.findUnique({
    where: {
      deletedAt: null,
      longitude_latitude: {
        longitude: new Prisma.Decimal(location[0]),
        latitude: new Prisma.Decimal(location[1])
      }
    }
  })
}

/**
 * Registers a facility together with its three mandatory essential resources
 * in ONE transaction — a facility can never exist half-configured. Caller may
 * pre-set initial availability per essential; anything omitted defaults to
 * Unavailable (never assume a service exists just because the facility does).
 */
const create = async (
  data: Prisma.FacilityCreateInput,
  essentials?: ReadonlyArray<{ essentialType: EssentialResourceType; isAvailable: boolean }>
) => {
  return prisma.$transaction(async (tx) => {
    const facility = await tx.facility.create({ data })

    const requested = new Map((essentials ?? []).map((entry) => [entry.essentialType, entry.isAvailable]))
    await tx.facilityResource.createMany({
      data: ESSENTIAL_RESOURCES.map((entry) => ({
        facilityId: facility.id,
        name: entry.name,
        type: "BOOLEAN" as const,
        isAvailable: requested.get(entry.type) ?? false,
        essentialType: entry.type,
      })),
    })

    return facility
  })
} 

const update = (facilityId: string, data: Prisma.FacilityUpdateInput) => {
  return prisma.facility.update({
    where: {
      id: facilityId
    },
    data
  })
}  

const updateStatus = (facilityId: string, status: FacilityStatus) => {
  return prisma.facility.update({
    where: {
      id: facilityId
    },
    data: {
      status
    }
  })
} 

const deleteById = (facilityId: string) => {
  return prisma.facility.delete({
    where: {
      id: facilityId
    }
  })
}

const findMany = (status?: FacilityStatus, deleted?: boolean) => {
  return prisma.facility.findMany({
    where: {
      ...(deleted ? { deletedAt: { not: null } } : { deletedAt: null }),
      ...(status ? { status } : {})
    },
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: { staff: true }
      }
    }
  })
}

const findManyAvailableWithResources = () => {
  return prisma.facility.findMany({
    where: { deletedAt: null, status: FacilityStatus.AVAILABLE },
    include: { resource: true },
    orderBy: { createdAt: "asc" },
  })
}
const findDeletedById = (facilityId: string) => {
  return prisma.facility.findFirst({
    where: { id: facilityId, deletedAt: { not: null } }
  })
}

const softDeleteById = (facilityId: string) => {
  return prisma.facility.update({
    where: { id: facilityId },
    data: { deletedAt: new Date() }
  })
}

const restoreById = (facilityId: string) => {
  return prisma.facility.update({
    where: { id: facilityId },
    data: { deletedAt: null }
  })
}

const countCheckedInStays = (facilityId: string) => {
  return prisma.facilityStay.count({
    where: { facilityId, checkedOutAt: null }
  })
}


export type RegistrySort = "name" | "capacity" | "staff" | "created"

/**
 * Registry listing — search + sort + pagination with per-row occupancy
 * (active stays -> members) and staff counts. Returns the paged envelope the
 * admin registry consumes; the legacy findMany above stays untouched for the
 * other call paths (map pickers, staff assignment, history scoping).
 */
const findManyPaged = async ({
  status,
  deleted,
  q,
  sort = "created",
  order = "asc",
  page = 1,
  pageSize = 25
}: {
  status?: FacilityStatus
  deleted?: boolean
  q?: string
  sort?: RegistrySort
  order?: "asc" | "desc"
  page?: number
  pageSize?: number
} = {}) => {
  const where: Prisma.FacilityWhereInput = {
    ...(deleted ? { deletedAt: { not: null } } : { deletedAt: null }),
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { address: { contains: q, mode: "insensitive" } }
          ]
        }
      : {})
  }

  const orderBy: Prisma.FacilityOrderByWithRelationInput =
    sort === "name"
      ? { name: order }
      : sort === "capacity"
        ? { maxCapacity: order }
        : sort === "staff"
          ? { staff: { _count: order } }
          : { createdAt: order }

  const [rows, total] = await Promise.all([
    prisma.facility.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { staff: true } } }
    }),
    prisma.facility.count({ where })
  ])

  // Occupancy enrichment: one grouped read over the page's active stays.
  const ids = rows.map((row) => row.id)
  const stays = ids.length
    ? await prisma.facilityStay.findMany({
        where: { checkedOutAt: null, facilityId: { in: ids } },
        select: { facilityId: true, _count: { select: { members: true } } }
      })
    : []
  const occupancy = new Map<string, { occupied: number; families: number }>()
  for (const stay of stays) {
    const entry = occupancy.get(stay.facilityId) ?? { occupied: 0, families: 0 }
    entry.families += 1
    entry.occupied += stay._count.members
    occupancy.set(stay.facilityId, entry)
  }

  return {
    total,
    page,
    pageSize,
    facilities: rows.map((row) => ({
      ...row,
      staffCount: row._count.staff,
      occupied: occupancy.get(row.id)?.occupied ?? 0,
      families: occupancy.get(row.id)?.families ?? 0
    }))
  }
}

/** Bulk soft-delete/restore (the same toggle semantics as deleteById). */
const bulkToggleDeleted = (ids: string[], deleted: boolean) => {
  return prisma.facility.updateMany({
    where: { id: { in: ids } },
    data: { deletedAt: deleted ? new Date() : null }
  })
}

export default {
  findManyPaged,
  bulkToggleDeleted,
  create,
  update,
  updateStatus,
  deleteById,
  findByLongLat,
  findById,
  findMany,
  findManyAvailableWithResources,
  findDeletedById,
  softDeleteById,
  restoreById,
  countCheckedInStays,
}
