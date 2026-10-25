/**
 * Vuln 2 — password-reset tokens must be single-use.
 *
 * `POST /auth/password/reset` is mounted as
 *   verifyToken(TokenType.RESET_PASS) -> handlePassReset
 * so the tests drive that exact middleware + handler pair: a replay of the
 * same Bearer token is the reported exploit.
 */
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.hoisted(() => {
  process.env.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "test-secret"
})
import type { Request, Response } from "express"
import bcrypt from "bcryptjs"

vi.mock("../src/services/token.services.js", async () => {
  const { fakeTokenService } = await import("./helpers/stores.js")
  return { default: fakeTokenService }
})
vi.mock("../src/services/user.services.js", async () => {
  const { fakeUserService } = await import("./helpers/stores.js")
  return { default: fakeUserService }
})
vi.mock("../src/services/refreshToken.services.js", async () => {
  const { fakeRefreshTokenService } = await import("./helpers/stores.js")
  return { default: fakeRefreshTokenService }
})
vi.mock("../src/utils/activityUtils.js", () => ({
  logActivity: vi.fn(async () => undefined),
}))
vi.mock("../src/core/ApiMailer.js", () => ({
  ApiMailer: { sendOTP: vi.fn(async () => undefined) },
}))

import verifyToken from "../src/middlewares/verifyToken.js"
import { handlePassReqReset, handlePassReset, handleRefresh, handleVerifyResetPass } from "../src/controllers/auth.controllers.js"
import { TokenType } from "../generated/prisma/index.js"
import { cryptoHash, generateCryptoToken } from "../src/utils/authUtils.js"
import {
  findTokensByType,
  resetStores,
  seedResetPassToken,
  seedToken,
  seedUser,
  tokens,
  users,
} from "./helpers/stores.js"
import { makeReq, makeRes, runMiddleware } from "./helpers/http.js"
import { REFRESH_TOKEN, OTP } from "../src/configs/tokenConfig.js"

const OWNER_PASSWORD = "OwnerPass!2026"
const ATTACKER_PASSWORD = "AttackerOwned!2026"

/** The real route pairing for POST /auth/password/reset. */
const runPassReset = async (rawToken: string, newPassword: string) => {
  const req = makeReq({
    headers: { authorization: `Bearer ${rawToken}` },
    body: { newPassword },
  })
  const res = makeRes()

  await runMiddleware(verifyToken(TokenType.RESET_PASS), req, res)
  await handlePassReset(req, res as unknown as Response)
  return res
}

beforeEach(() => {
  resetStores()
})

describe("POST /auth/password/reset — reset token single-use", () => {
  it("lets the token owner change their password once", async () => {
    const user = seedUser()
    const rawToken = generateCryptoToken()
    seedResetPassToken(user, cryptoHash(rawToken))

    await runPassReset(rawToken, OWNER_PASSWORD)

    expect(await bcrypt.compare(OWNER_PASSWORD, user.password)).toBe(true)
  })

  it("consumes the reset token so a replay cannot change the password again", async () => {
    const user = seedUser()
    const rawToken = generateCryptoToken()
    seedResetPassToken(user, cryptoHash(rawToken))

    // The legitimate owner completes the reset.
    await runPassReset(rawToken, OWNER_PASSWORD)
    expect(await bcrypt.compare(OWNER_PASSWORD, user.password)).toBe(true)

    // An attacker who intercepted the token replays it to take the account.
    await expect(runPassReset(rawToken, ATTACKER_PASSWORD)).rejects.toThrow(/invalid/i)

    // The password must still be the one the owner set.
    expect(await bcrypt.compare(OWNER_PASSWORD, user.password)).toBe(true)
    expect(await bcrypt.compare(ATTACKER_PASSWORD, user.password)).toBe(false)
  })

  it("signs out every device when the password is reset", async () => {
    const user = seedUser()
    const rawToken = generateCryptoToken()
    seedResetPassToken(user, cryptoHash(rawToken))

    const { refreshTokens } = await import("./helpers/stores.js")
    refreshTokens.push(
      { id: "rt-1", userId: user.id, token: "hash-a", expiresAt: new Date(Date.now() + 60_000) },
      { id: "rt-2", userId: user.id, token: "hash-b", expiresAt: new Date(Date.now() + 60_000) },
    )

    await runPassReset(rawToken, OWNER_PASSWORD)

    expect(refreshTokens).toHaveLength(0)
  })
})

describe("reset token lifecycle", () => {
  it("retires earlier REQ_RESET_PASS tokens when a new one is requested", async () => {
    const user = seedUser()
    const staleHash = cryptoHash("stale-raw-token")
    seedToken(user, staleHash, { type: TokenType.REQ_RESET_PASS })

    const req = makeReq({ body: { email: user.email } })
    const res = makeRes()
    await handlePassReqReset(req, res as unknown as Response)

    const live = findTokensByType(user.id, TokenType.REQ_RESET_PASS)
    expect(live).toHaveLength(1)
    expect(live[0].token).not.toBe(staleHash)
  })

  it("retires earlier RESET_PASS tokens when a fresh one is issued", async () => {
    const user = seedUser()

    // A leftover reset token from an earlier (never-completed) reset attempt.
    const leftoverHash = cryptoHash("leftover-reset-token")
    seedResetPassToken(user, leftoverHash)

    // Owner proves the OTP, which issues the token the reset will consume.
    const reqOtpToken = generateCryptoToken()
    const reqOtpTokenHash = cryptoHash(reqOtpToken)
    seedToken(user, reqOtpTokenHash, {
      type: TokenType.REQ_RESET_PASS,
      payload: { otp: cryptoHash("12345"), attempts: 0 },
    })

    const req = makeReq({
      headers: { authorization: `Bearer ${reqOtpToken}` },
      body: { otp: "12345" },
    })
    const res = makeRes()

    await runMiddleware(verifyToken(TokenType.REQ_RESET_PASS), req, res)
    await handleVerifyResetPass(req, res as unknown as Response)

    const live = findTokensByType(user.id, TokenType.RESET_PASS)
    expect(live).toHaveLength(1)
    expect(live[0].token).not.toBe(leftoverHash)
  })

  it("rejects a replayed REQ_RESET_PASS token after the OTP was already verified", async () => {
    const user = seedUser()
    const rawToken = generateCryptoToken()
    seedToken(user, cryptoHash(rawToken), {
      type: TokenType.REQ_RESET_PASS,
      payload: { otp: cryptoHash("12345"), attempts: 0 },
    })

    const req = makeReq({
      headers: { authorization: `Bearer ${rawToken}` },
      body: { otp: "12345" },
    })
    const res = makeRes()

    await runMiddleware(verifyToken(TokenType.REQ_RESET_PASS), req, res)
    await handleVerifyResetPass(req, res as unknown as Response)

    // Same OTP token again — must be gone.
    const req2 = makeReq({
      headers: { authorization: `Bearer ${rawToken}` },
      body: { otp: "12345" },
    })
    await expect(
      runMiddleware(verifyToken(TokenType.REQ_RESET_PASS), req2, makeRes()),
    ).rejects.toThrow(/invalid/i)

    expect(tokens.filter((t) => t.type === TokenType.REQ_RESET_PASS)).toHaveLength(0)
    expect(users.get(user.id)).toBeDefined()
  })
})

describe("OTP guessing budget (anti-brute-force)", () => {
  it("carries failed attempts across freshly minted reset tokens and resets only after the window", async () => {
    const user = seedUser()
    const raw1 = generateCryptoToken()
    seedToken(user, cryptoHash(raw1), {
      type: TokenType.REQ_RESET_PASS,
      payload: { otp: cryptoHash("12345"), attempts: 0, windowStart: Date.now() },
    })

    // Burn the full guessing budget with wrong OTPs.
    for (let i = 0; i < 10; i++) {
      const req = makeReq({
        headers: { authorization: `Bearer ${raw1}` },
        body: { otp: "00000" },
      })
      await runMiddleware(verifyToken(TokenType.REQ_RESET_PASS), req, makeRes())
      await expect(
        handleVerifyResetPass(req, makeRes() as any),
      ).rejects.toThrow(/PIN|attempts/i)
    }

    // An attacker mints a fresh token (the request endpoint is unauthenticated)...
    const resReq = makeRes()
    await handlePassReqReset(makeReq({ body: { email: user.email } }), resReq as any)
    const raw2 = (resReq.body as any).data.token
    const carried = findTokensByType(user.id, TokenType.REQ_RESET_PASS)
    expect(carried).toHaveLength(1)
    // ...but the budget is per USER: the fresh token inherits the burned attempts.
    expect((carried[0].payload as any).attempts).toBe(10)

    // Even the CORRECT OTP is now rejected inside the window.
    const req2 = makeReq({
      headers: { authorization: `Bearer ${raw2}` },
      body: { otp: "12345" },
    })
    await runMiddleware(verifyToken(TokenType.REQ_RESET_PASS), req2, makeRes())
    await expect(
      handleVerifyResetPass(req2, makeRes() as any),
    ).rejects.toThrow(/attempts/i)

    // Once the window lapses the budget starts fresh (bounded lockout, not a
    // permanent one): age the window, re-request, and the real OTP works.
    const rec = findTokensByType(user.id, TokenType.REQ_RESET_PASS)[0]
    rec.payload = {
      ...(rec.payload as any),
      windowStart: Date.now() - OTP.ATTEMPT_WINDOW_MS - 1_000,
    }
    const resReq2 = makeRes()
    await handlePassReqReset(makeReq({ body: { email: user.email } }), resReq2 as any)
    const raw3 = (resReq2.body as any).data.token
    // Each request-reset generates a fresh random OTP (emailed to the owner) —
    // the correct guess for the new token is what the mocked mailer received.
    const { ApiMailer } = await import("../src/core/ApiMailer.js")
    const sentOtp = (ApiMailer.sendOTP as any).mock.calls.at(-1)[1] as string
    const req3 = makeReq({
      headers: { authorization: `Bearer ${raw3}` },
      body: { otp: sentOtp },
    })
    await runMiddleware(verifyToken(TokenType.REQ_RESET_PASS), req3, makeRes())
    await handleVerifyResetPass(req3, makeRes() as any)
    expect(findTokensByType(user.id, TokenType.RESET_PASS)).toHaveLength(1)
  })
})

describe("refresh rotation — reuse detection", () => {
  it("revokes the whole session family when a rotated token is replayed after the grace window", async () => {
    const { refreshTokens } = await import("./helpers/stores.js")
    const user = seedUser({ isSetupDone: true })
    const rawRotated = generateCryptoToken()
    refreshTokens.push(
      {
        id: "rt-old",
        userId: user.id,
        token: cryptoHash(rawRotated),
        expiresAt: new Date(Date.now() + 60_000),
        rotatedAt: new Date(Date.now() - REFRESH_TOKEN.ROTATION_GRACE_MS - 5_000),
      },
      {
        id: "rt-live",
        userId: user.id,
        token: cryptoHash("live-successor"),
        expiresAt: new Date(Date.now() + 60_000),
        rotatedAt: null,
      },
    )

    const req = makeReq({ cookies: { [REFRESH_TOKEN.COOKIE_NAME]: rawRotated } })
    await expect(handleRefresh(req, makeRes() as any)).rejects.toThrow(/invalid/i)
    // Reuse = compromise: the surviving successor dies too.
    expect(refreshTokens.filter((r) => r.userId === user.id)).toHaveLength(0)
  })

  it("does not extend the grace window on a within-grace replay", async () => {
    const { refreshTokens } = await import("./helpers/stores.js")
    const user = seedUser({ isSetupDone: true })
    const rawRotated = generateCryptoToken()
    const stamped = new Date(Date.now() - 30_000)
    refreshTokens.push({
      id: "rt-old",
      userId: user.id,
      token: cryptoHash(rawRotated),
      expiresAt: new Date(Date.now() + 60_000),
      rotatedAt: stamped,
    })

    const req = makeReq({ cookies: { [REFRESH_TOKEN.COOKIE_NAME]: rawRotated } })
    await handleRefresh(req, makeRes() as any)

    const old = refreshTokens.find((r) => r.id === "rt-old")
    // The rotation stamp stays at the FIRST rotation — a replay must not push
    // it forward and extend the replay window.
    expect(old?.rotatedAt?.getTime()).toBe(stamped.getTime())
  })
})
