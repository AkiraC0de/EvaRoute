import prisma from "../lib/prisma.js"
import { Prisma, User } from "../../generated/prisma/client.js";

// Credential-safe projection: every user field EXCEPT the password hash.
// Hot paths that never verify credentials must read through this so hashes
// never leave the DB. Auth flows that legitimately compare the hash (login,
// setup) keep using `findById`/`findByEmail` deliberately.
const safeUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  isSetupDone: true,
  createdAt: true
} satisfies Prisma.UserSelect

const findById = (id: string) => {
  return prisma.user.findUnique({
    where: { id }
  })
}

/**
 * Credential-safe lookup (no `password`). INTENDED CALLER: the per-request
 * user re-check in verifyAuthentication.ts (needs only id/isActive/role) —
 * that middleware belongs to the parent agent, so the switch happens there;
 * every other identity-only read (e.g. the bulk audit actor lookup) can use
 * this too.
 */
const findByIdSafe = (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: safeUserSelect
  })
}

const findByIdWithFacility = (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      ...safeUserSelect,
      facilityStaff: {
        select: { facility: { select: { id: true, name: true } } }
      }
    }
  })
}

const findByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email }
  })
}

const create = (data: Prisma.UserCreateInput) => {
  return prisma.user.create({ 
    data
  })
}

const update = (id: string ,data: Prisma.UserUpdateInput) => {
  return prisma.user.update({
    where: { id },
    data
  })
}

// Abuse bound, NOT pagination: the admin staff registry has no paging today,
// so cap the list to keep an abusive query from pulling an unbounded result.
// Response shape is unchanged (plain array).
const STAFF_LIST_MAX = 500

const findManyStaff = (filter: {
  unassigned?: boolean
  facilityId?: string
  search?: string
  status?: "ACTIVE" | "INACTIVE"
}) => {
  return prisma.user.findMany({
    where: {
      role: "FACILITY_STAFF",
      ...(filter.status ? { isActive: filter.status === "ACTIVE" } : {}),
      // `unassigned: true` narrows to staff without a facility; `false`/absent
      // means "regardless of assignment" (no filter).
      ...(filter.unassigned === true ? { facilityStaff: null } : {}),
      ...(filter.facilityId ? { facilityStaff: { facilityId: filter.facilityId } } : {}),
      ...(filter.search
        ? {
            OR: [
              { email: { contains: filter.search, mode: "insensitive" } },
              { firstName: { contains: filter.search, mode: "insensitive" } },
              { lastName: { contains: filter.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      ...safeUserSelect,
      facilityStaff: {
        select: { facility: { select: { id: true, name: true } } }
      }
    },
    orderBy: { createdAt: "asc" },
    take: STAFF_LIST_MAX
  })
}

const setActive = (id: string, isActive: boolean) => {
  return prisma.user.update({
    where: { id },
    data: { isActive }
  })
}

const deleteById = (id: string) => {
  return prisma.user.delete({
    where: { id }
  })
}

const updatePassword = (id: string, newPassword: string) => {
  return prisma.user.update({
    where: { id },
    data: {
      password: newPassword
    }
  })
}

export default {
  create,
  update,
  updatePassword,
  setActive,
  deleteById,
  findManyStaff,
  findById,
  findByIdSafe,
  findByIdWithFacility,
  findByEmail
}
