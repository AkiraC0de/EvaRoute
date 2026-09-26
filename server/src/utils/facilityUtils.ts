import { Prisma } from "../../generated/prisma"

export type FacilityEntity = Prisma.FacilityGetPayload<Record<string, never>>

export const toFacilityDTO = (f: FacilityEntity) => ({
  id: f.id,
  name: f.name,
  address: f.address,
  note: f.note,
  maxCapacity: f.maxCapacity,
  status: f.status,
  latitude: f.latitude,
  longitude: f.longitude,
  createdAt: f.createdAt,
})
