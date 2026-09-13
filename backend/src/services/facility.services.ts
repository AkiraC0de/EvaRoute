import { FacilityStatus, Prisma } from "../../generated/prisma"
import prisma from "../lib/prisma"

const create = (data: Prisma.FacilityCreateInput) => {
  return prisma.facility.create({
    data,
    include: { resource: true },
  })
}

const findAll = () => {
  return prisma.facility.findMany({
    orderBy: { name: "asc" },
    include: { resource: true },
  })
}

const findById = (facilityId: string) => {
  return prisma.facility.findUnique({
    where: { id: facilityId },
    include: { resource: true },
  })
}

const findByStaffId = (staffId: string) => {
  return prisma.facility.findFirst({
    where: { staff: { some: { staffId } } },
    include: { resource: true },
  })
}

const update = (facilityId: string, data: Prisma.FacilityUpdateInput) => {
  return prisma.facility.update({
    where: {
      id: facilityId
    },
    data,
    include: { resource: true },
  })
}  

const updateStatus = (facilityId: string, status: FacilityStatus) => {
  return prisma.facility.update({
    where: {
      id: facilityId
    },
    data: { status },
    include: { resource: true },
  })
} 

const deleteById = (facilityId: string) => {
  return prisma.facility.delete({
    where: {
      id: facilityId
    }
  })
}

const findResources = (facilityId: string) => {
  return prisma.facilityResource.findMany({
    where: { facilityId },
    orderBy: { name: "asc" },
  })
}

const createResource = (facilityId: string, data: Prisma.FacilityResourceCreateWithoutFacilityInput) => {
  return prisma.facilityResource.create({
    data: { ...data, facility: { connect: { id: facilityId } } },
  })
}

const findResource = (facilityId: string, resourceId: string) => {
  return prisma.facilityResource.findFirst({ where: { id: resourceId, facilityId } })
}

const updateResource = (facilityId: string, resourceId: string, data: Prisma.FacilityResourceUpdateInput) => {
  return prisma.facilityResource.updateMany({
    where: { id: resourceId, facilityId },
    data,
  })
}

const deleteResource = (facilityId: string, resourceId: string) => {
  return prisma.facilityResource.deleteMany({ where: { id: resourceId, facilityId } })
}

export default {
  create,
  findAll,
  findById,
  findByStaffId,
  update,
  updateStatus,
  deleteById,
  findResources,
  createResource,
  findResource,
  updateResource,
  deleteResource,
}