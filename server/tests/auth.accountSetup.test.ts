/**
 * Vuln 1 — `POST /auth/account-setup` must be a one-time, first-run action.
 *
 * The endpoint replaces the account password. Once `isSetupDone` is true the
 * only legitimate way to change a password is `POST /auth/password/change`,
 * which proves identity with the CURRENT password. Without that guard a stolen
 * 15-minute access token becomes permanent account takeover.
 */
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Response } from "express"
import bcrypt from "bcryptjs"

vi.mock("../src/services/user.services.js", async () => {
  const { fakeUserService } = await import("./helpers/stores.js")
  return { default: fakeUserService }
})
vi.mock("../src/services/token.services.js", async () => {
  const { fakeTokenService } = await import("./helpers/stores.js")
  return { default: fakeTokenService }
})
vi.mock("../src/services/refreshToken.services.js", async () => {
  const { fakeRefreshTokenService } = await import("./helpers/stores.js")
  return { default: fakeRefreshTokenService }
})
vi.mock("../src/utils/activityUtils.js", () => ({
  logActivity: vi.fn(async () => undefined),
}))

import { handleAccountSetup } from "../src/controllers/auth.controllers.js"
import { refreshTokens, resetStores, seedUser, SYSTEM_GENERATED_PASSWORD } from "./helpers/stores.js"
import { makeReq, makeRes } from "./helpers/http.js"

const NEW_PASSWORD = "Str0ng!Pass99"

const runAccountSetup = (userId: string, role: string, body: Record<string, unknown>) => {
  const req = makeReq({
    auth: { userId, role },
    body,
    cookies: {},
  })
  const res = makeRes()
  return { req, res, promise: handleAccountSetup(req, res as unknown as Response) }
}

beforeEach(() => {
  resetStores()
})

describe("POST /auth/account-setup — first-run only", () => {
  it("completes first-time setup and replaces the generated password", async () => {
    const user = seedUser({ isSetupDone: false })

    const { res, promise } = runAccountSetup(user.id, user.role, {
      newPassword: NEW_PASSWORD,
      firstName: "Ada",
      lastName: "Lovelace",
    })
    await promise

    expect(await bcrypt.compare(NEW_PASSWORD, user.password)).toBe(true)
    expect(user.isSetupDone).toBe(true)
    expect(user.firstName).toBe("Ada")
    expect(user.lastName).toBe("Lovelace")

    const body = res.body as { message: string; data: { user: { isSetupDone: boolean } } }
    expect(body.data.user.isSetupDone).toBe(true)
  })

  it("rejects account setup once the account has already been set up", async () => {
    const user = seedUser({
      isSetupDone: true,
      firstName: "Ada",
      lastName: "Lovelace",
    })

    const { promise } = runAccountSetup(user.id, user.role, {
      newPassword: "AttackerOwned!2026",
      firstName: "Eve",
      lastName: "Mallory",
    })

    await expect(promise).rejects.toThrow(/already been set up/i)

    // Nothing about the account may change: password, name and sessions all
    // stay exactly as the real owner left them.
    expect(user.password).toBe(SYSTEM_GENERATED_PASSWORD)
    expect(user.firstName).toBe("Ada")
    expect(user.lastName).toBe("Lovelace")
    expect(user.isSetupDone).toBe(true)
  })

  it("does not revoke the owner's sessions when a setup call is refused", async () => {
    const user = seedUser({ isSetupDone: true })
    refreshTokens.push({
      id: "rt-1",
      userId: user.id,
      token: "owner-session",
      expiresAt: new Date(Date.now() + 60_000),
    })

    const { promise } = runAccountSetup(user.id, user.role, {
      newPassword: "AttackerOwned!2026",
      firstName: "Eve",
      lastName: "Mallory",
    })
    await expect(promise).rejects.toThrow(/already been set up/i)

    expect(refreshTokens).toHaveLength(1)
  })
})
