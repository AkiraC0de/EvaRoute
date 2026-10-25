/**
 * In-memory stand-ins for the Prisma-backed service modules.
 *
 * Tests assert on the resulting store state — "the reset token row is gone",
 * "the password hash is unchanged" — rather than on mock call counts, so the
 * security property under test is what actually gets checked.
 */

export type UserRecord = {
  id: string
  email: string
  password: string
  firstName: string | null
  lastName: string | null
  role: string
  isActive: boolean
  isSetupDone: boolean
}

export type TokenRecord = {
  id: string
  userId: string
  type: string
  /** SHA-256 hex of the raw token — mirrors the production schema. */
  token: string
  expiresAt: Date
  payload?: Record<string, unknown>
  user: UserRecord
}

export type RefreshRecord = {
  id: string
  userId: string
  token: string
  expiresAt: Date
  rotatedAt?: Date | null
}

export const users = new Map<string, UserRecord>()
export const tokens: TokenRecord[] = []
export const refreshTokens: RefreshRecord[] = []

export const resetStores = () => {
  users.clear()
  tokens.length = 0
  refreshTokens.length = 0
}

/** A system-generated password hash — a stand-in, never a real bcrypt value. */
export const SYSTEM_GENERATED_PASSWORD = "$2a$12$SYSTEMGENERATEDPLACEHOLDERHASH00000000000000000000000"

export const seedUser = (over: Partial<UserRecord> = {}): UserRecord => {
  const user: UserRecord = {
    id: "user-1",
    email: "staff@example.com",
    password: SYSTEM_GENERATED_PASSWORD,
    firstName: null,
    lastName: null,
    role: "FACILITY_STAFF",
    isActive: true,
    isSetupDone: false,
    ...over,
  }
  users.set(user.id, user)
  return user
}

export const seedToken = (
  user: UserRecord,
  hash: string,
  over: Partial<TokenRecord> = {},
): TokenRecord => {
  const record: TokenRecord = {
    id: `tok-${tokens.length + 1}`,
    userId: user.id,
    type: "REQ_RESET_PASS",
    token: hash,
    expiresAt: new Date(Date.now() + 15 * 60_000),
    user,
    ...over,
  }
  tokens.push(record)
  return record
}

export const seedResetPassToken = (user: UserRecord, hash: string, over: Partial<TokenRecord> = {}) =>
  seedToken(user, hash, { type: "RESET_PASS", ...over })

export const findTokensByType = (userId: string, type: string) =>
  tokens.filter((t) => t.userId === userId && t.type === type)

/* -------------------------------------------------------------------------- */
/* Service fakes                                                              */
/* -------------------------------------------------------------------------- */

export const fakeUserService = {
  findById: (id: string) => Promise.resolve(users.get(id) ?? null),
  findByEmail: (email: string) =>
    Promise.resolve([...users.values()].find((u) => u.email === email) ?? null),
  updatePassword: (id: string, password: string) => {
    const user = users.get(id)
    if (!user) throw new Error("User not found.")
    user.password = password
    return Promise.resolve(user)
  },
  update: (id: string, data: Partial<UserRecord>) => {
    const user = users.get(id)
    if (!user) throw new Error("User not found.")
    Object.assign(user, data)
    return Promise.resolve(user)
  },
}

export const fakeTokenService = {
  findByToken: (token: string, type: string) => {
    const found = tokens.find((t) => t.token === token && t.type === type)
    return Promise.resolve(found ?? null)
  },
  findByUserIdType: (userId: string, type: string) =>
    Promise.resolve(tokens.find((t) => t.userId === userId && t.type === type) ?? null),
  deleteById: (id: string) => {
    const idx = tokens.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error("Token not found.")
    return Promise.resolve(tokens.splice(idx, 1)[0])
  },
  deleteByUserIdType: (userId: string, type: string) => {
    let count = 0
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (tokens[i].userId === userId && tokens[i].type === type) {
        tokens.splice(i, 1)
        count++
      }
    }
    return Promise.resolve({ count })
  },
  create: (data: { userId: string; type: string; token: string; expiresAt?: Date; payload?: Record<string, unknown> }) => {
    const record: TokenRecord = {
      id: `tok-${tokens.length + 1}`,
      userId: data.userId,
      type: data.type,
      token: data.token,
      expiresAt: data.expiresAt ?? new Date(Date.now() + 15 * 60_000),
      payload: data.payload,
      user: users.get(data.userId)!,
    }
    tokens.push(record)
    return Promise.resolve(record)
  },
  createReqResetPass: (
    userId: string,
    hashOtp: string,
    hashToken: string,
    attempts = 0,
    windowStart = Date.now(),
    expiresAt?: Date,
  ) =>
    fakeTokenService.create({
      userId,
      type: "REQ_RESET_PASS",
      token: hashToken,
      expiresAt,
      payload: { otp: hashOtp, attempts, windowStart },
    }),
  createResetPass: (userId: string, hashToken: string, expiresAt?: Date) =>
    fakeTokenService.create({ userId, type: "RESET_PASS", token: hashToken, expiresAt }),
  createEmailVerify: (userId: string, hashOtp: string, hashToken: string, expiresAt?: Date) =>
    fakeTokenService.create({
      userId,
      type: "EMAIL_VERIFY",
      token: hashToken,
      expiresAt,
      payload: { otp: hashOtp, attempts: 0 },
    }),
  incrementAttemptById: (id: string) => {
    const token = tokens.find((t) => t.id === id)
    if (!token) throw new Error("Token not found.")
    const payload = (token.payload ?? { otp: "", attempts: 0 }) as { otp: string; attempts: number }
    token.payload = { ...payload, attempts: payload.attempts + 1 }
    // Production returns the NEW attempt count (atomic UPDATE ... RETURNING).
    return Promise.resolve(payload.attempts + 1)
  },
  // Mirrors the production transaction: retire earlier RESET_PASS rows, mint
  // the fresh one and consume the request token as one unit.
  consumeReqResetAndCreateResetPass: (userId: string, consumedTokenId: string, hashToken: string) => {
    fakeTokenService.deleteByUserIdType(userId, "RESET_PASS")
    fakeTokenService.createResetPass(userId, hashToken)
    fakeTokenService.deleteById(consumedTokenId)
    return Promise.resolve(undefined)
  },
  // Mirrors the production transaction: password change + single-use token
  // consumption + full session purge land together or not at all.
  consumeResetPassAndSetPassword: (userId: string, consumedTokenId: string, hashedPassword: string) => {
    fakeUserService.updatePassword(userId, hashedPassword)
    fakeTokenService.deleteById(consumedTokenId)
    fakeRefreshTokenService.deleteAllByUserId(userId)
    return Promise.resolve(undefined)
  },
}

export const fakeRefreshTokenService = {
  findByToken: (token: string) =>
    Promise.resolve(refreshTokens.find((r) => r.token === token) ?? null),
  deleteById: (id: string) => {
    const idx = refreshTokens.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error("Refresh token not found.")
    return Promise.resolve(refreshTokens.splice(idx, 1)[0])
  },
  deleteByToken: (token: string) => {
    const idx = refreshTokens.findIndex((r) => r.token === token)
    return Promise.resolve(idx === -1 ? null : refreshTokens.splice(idx, 1)[0])
  },
  deleteAllByUserId: (userId: string) => {
    let count = 0
    for (let i = refreshTokens.length - 1; i >= 0; i--) {
      if (refreshTokens[i].userId === userId) {
        refreshTokens.splice(i, 1)
        count++
      }
    }
    return Promise.resolve({ count })
  },
  create: (userId: string, tokenHash: string, expiresAt?: Date) => {
    const record: RefreshRecord = {
      id: `rt-new-${refreshTokens.length + 1}`,
      userId,
      token: tokenHash,
      expiresAt: expiresAt ?? new Date(Date.now() + 60_000),
      rotatedAt: null,
    }
    refreshTokens.push(record)
    return Promise.resolve(record)
  },
  // Production stamps only the FIRST rotation (updateMany where rotatedAt: null)
  // — a replay must not extend the grace window.
  markRotated: (id: string) => {
    const row = refreshTokens.find((r) => r.id === id)
    if (!row) throw new Error("Refresh token not found.")
    if (row.rotatedAt == null) {
      row.rotatedAt = new Date()
      return Promise.resolve({ count: 1 })
    }
    return Promise.resolve({ count: 0 })
  },
  deleteAllByUserIdExcept: (userId: string, keepId: string) => {
    let count = 0
    for (let i = refreshTokens.length - 1; i >= 0; i--) {
      if (refreshTokens[i].userId === userId && refreshTokens[i].id !== keepId) {
        refreshTokens.splice(i, 1)
        count++
      }
    }
    return Promise.resolve({ count })
  },
}
