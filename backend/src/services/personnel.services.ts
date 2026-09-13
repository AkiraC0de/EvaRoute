import bcrypt from "bcryptjs"
import prisma from "../lib/prisma"
import { cryptoHash, generateCryptoToken } from "../utils/authUtils"
import { TokenType, UserRole } from "../../generated/prisma"
import { ApiMailer } from "../core/ApiMailer"

const SETUP_EXPIRATION_HOURS = 24

const create = async (facilityId: string, email: string, firstName: string, lastName: string) => {
  const rawToken = generateCryptoToken()
  const expiresAt = new Date(Date.now() + SETUP_EXPIRATION_HOURS * 60 * 60 * 1000)
  const temporaryPassword = await bcrypt.hash(generateCryptoToken(), 10)

  const personnel = await prisma.$transaction(async (transaction) => {
    const user = await transaction.user.create({
      data: { email, firstName, lastName, password: temporaryPassword, role: UserRole.FACILITY_STAFF },
    })
    await transaction.facilityStaff.create({ data: { staffId: user.id, facilityId } })
    await transaction.token.create({
      data: { userId: user.id, token: cryptoHash(rawToken), type: TokenType.FACILITY_SETUP, expiresAt },
    })
    await ApiMailer.sendFacilitySetup(user.email, rawToken)
    return user
  })

  return { id: personnel.id, email: personnel.email, firstName: personnel.firstName, lastName: personnel.lastName }
}

const completeSetup = async (rawToken: string, newPassword: string) => {
  const token = await prisma.token.findUnique({ where: { token: cryptoHash(rawToken) } })
  if (!token || token.type !== TokenType.FACILITY_SETUP || token.expiresAt.getTime() < Date.now()) return false

  const password = await bcrypt.hash(newPassword, 10)
  const completed = await prisma.$transaction(async (transaction) => {
    const consumed = await transaction.token.deleteMany({
      where: { id: token.id, type: TokenType.FACILITY_SETUP, expiresAt: { gt: new Date() } },
    })
    if (!consumed.count) return false
    await transaction.user.update({ where: { id: token.userId }, data: { password, isSetupDone: true } })
    return true
  })
  return completed
}

export default { create, completeSetup }