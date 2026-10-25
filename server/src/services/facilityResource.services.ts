import prisma from "../lib/prisma.js"
import { Prisma } from "../../generated/prisma/client.js";

const findById = (resourceId: string) => {
  return prisma.facilityResource.findUnique({
    where: { id: resourceId },
    include: { facility: true }
  })
}

// Abuse bound, NOT pagination: a facility's resource rows are few by design,
// so a hard take keeps a corrupted/hostile facility from returning an
// unbounded list. Response shape is unchanged (plain array).
const RESOURCE_LIST_MAX = 500

const findByFacilityId = (facilityId: string) => {
  return prisma.facilityResource.findMany({
    where: { facilityId },
    orderBy: { name: "asc" },
    take: RESOURCE_LIST_MAX
  })
}

const findByNameInFacility = (facilityId: string, name: string) => {
  return prisma.facilityResource.findFirst({
    where: { facilityId, name }
  })
}

const create = (data: Prisma.FacilityResourceCreateInput) => {
  return prisma.facilityResource.create({ data })
}

const update = (resourceId: string, data: Prisma.FacilityResourceUpdateInput) => {
  return prisma.facilityResource.update({
    where: { id: resourceId },
    data
  })
}

const deleteById = (resourceId: string) => {
  return prisma.facilityResource.delete({
    where: { id: resourceId }
  })
}

export default {
  findById,
  findByFacilityId,
  findByNameInFacility,
  create,
  update,
  deleteById
}
