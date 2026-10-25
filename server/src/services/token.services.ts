import prisma from "../lib/prisma.js"
import { Prisma, TokenType, Token } from "../../generated/prisma/client.js";
import { REFRESH_TOKEN, REQ_RESET_PASS_TOKEN, RESET_PASS_TOKEN } from "../configs/tokenConfig.js";

const findByUserIdType = (userId: string, type: TokenType) => {
  return prisma.token.findFirst({
    where: { 
      userId,
      type
    }
  })
}

const findByToken = (token: string, type: TokenType) => {
  return prisma.token.findUnique({
    where: {
      token,
      type
    },
    include: {
      user: true,
    },
  })
}

const deleteByUserIdType = (userId: string, type: TokenType) => {
  return prisma.token.deleteMany({
    where: {
      userId,
      type
    }
  })
}

const create = (data: Prisma.TokenCreateInput) => {
  return prisma.token.create({
    data
  })
}

const createEmailVerify = (userId: string, otpHash: string, tokenHash: string, expiresAt?: Date) => {
  const EXPIRATION_IN_MIN = 15

  const expirationDate = new Date()
  expirationDate.setMinutes(expirationDate.getMinutes() + EXPIRATION_IN_MIN)
  
  return prisma.token.create({
    data: {
      userId,
      type: "EMAIL_VERIFY",
      expiresAt : expiresAt ?? expirationDate,
      token: tokenHash,
      payload: {
        otp: otpHash,
        attempts: 0
      }
    }
  })
}

const createReqResetPass = (userId: string, hashOtp: string, hashToken: string, attempts = 0, windowStart = Date.now(), expiresAt?: Date) => {
  const expirationDate = new Date()
  expirationDate.setMinutes(expirationDate.getMinutes() + REQ_RESET_PASS_TOKEN.DEFAULT_EXPIRATION_IN_MINS)
  
  return prisma.token.create({
    data: {
      userId,
      type: TokenType.REQ_RESET_PASS,
      expiresAt : expiresAt ?? expirationDate,
      token: hashToken,
      payload: {
        otp: hashOtp,
        // attempts/windowStart carry the per-user OTP guessing budget across
        // tokens minted inside OTP.ATTEMPT_WINDOW_MS (anti-brute-force).
        attempts,
        windowStart
      }
    }
  })
}

const createResetPass = (userId: string, hashToken: string, expiresAt?: Date) => {
  const expirationDate = new Date()
  expirationDate.setMinutes(expirationDate.getMinutes() + RESET_PASS_TOKEN.DEFAULT_EXPIRATION_IN_MINS)
  
  return prisma.token.create({
    data: {
      userId,
      type: TokenType.RESET_PASS,
      expiresAt : expiresAt ?? expirationDate,
      token: hashToken
    }
  })
}

const incrementAttemptById = async (tokenId: string) => {
  // Atomic increment (single SQL statement): a read-modify-write here let
  // concurrent verifies lose updates and bypass the MAX_ATTEMPTS cap.
  const rows = await prisma.$queryRaw<{ attempts: number }[]>`
    UPDATE "token"
    SET payload = jsonb_set(
      COALESCE(payload, '{}'::jsonb),
      '{attempts}',
      to_jsonb(COALESCE((payload->>'attempts')::int, 0) + 1)
    )
    WHERE id = ${tokenId}::uuid
    RETURNING COALESCE((payload->>'attempts')::int, 0) AS attempts
  `

  if (rows.length === 0) {
    throw new Error("Token not found.")
  }

  return rows[0].attempts
}

// Atomically consume the verified request token and mint the single-use reset
// token: either all three statements land or none do, so a partial failure can
// never leave both tokens (or neither) usable.
const consumeReqResetAndCreateResetPass = (userId: string, consumedTokenId: string, hashToken: string) => {
  return prisma.$transaction([
    prisma.token.deleteMany({ where: { userId, type: TokenType.RESET_PASS } }),
    createResetPass(userId, hashToken),
    prisma.token.delete({ where: { id: consumedTokenId } }),
  ])
}

// AUTH-13: expired one-time tokens and dead refresh rows were only deleted
// when presented — a table that grows forever and widens the window in which
// a DB leak exposes usable-at-rest hashes. Purge: expired Token rows, expired
// RefreshToken rows, and rotated rows whose grace window has passed.
const purgeExpiredAuthRows = () => {
  const now = new Date()
  return prisma.$transaction([
    prisma.token.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { rotatedAt: { lt: new Date(now.getTime() - REFRESH_TOKEN.ROTATION_GRACE_MS) } },
        ],
      },
    }),
  ])
}

const deleteById = (tokenId: string) => {
  return prisma.token.delete({
    where: {
      id: tokenId
    }
  })
}

// Atomically set the password, consume the single-use reset token and revoke
// every session: a failed token delete must never leave a live reset bearer
// token behind after the password has already changed (and a failure in one
// step must not orphan the others).
const consumeResetPassAndSetPassword = (userId: string, consumedTokenId: string, hashedPassword: string) => {
  return prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } }),
    prisma.token.delete({ where: { id: consumedTokenId } }),
    prisma.refreshToken.deleteMany({ where: { userId } }),
  ])
}

export default {
  findByUserIdType,
  deleteByUserIdType,
  create,
  createEmailVerify,
  createReqResetPass,
  findByToken,
  incrementAttemptById,
  consumeReqResetAndCreateResetPass,
  consumeResetPassAndSetPassword,
  purgeExpiredAuthRows,
  deleteById,
  createResetPass
}