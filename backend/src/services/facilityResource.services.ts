import prisma from "../lib/prisma"
import { Prisma } from "../../generated/prisma/client";

const findById = (resourceId: string) => {
  return prisma.facilityResource.findUnique({
    where: { id: resourceId },
    include: { facility: true }
  })
}

const findByFacilityId = (facilityId: string) => {
  return prisma.facilityResource.findMany({
    where: { facilityId },
    orderBy: { name: "asc" }
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
