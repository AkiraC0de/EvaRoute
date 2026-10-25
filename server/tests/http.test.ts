/**
 * HTTP-layer regression suite (TST-01): drives the REAL Express app over a
 * real socket — routing, middleware, rate limiting, the error envelope and
 * the deprecated GET shims. Services are in-memory fakes (see helpers/stores)
 * so no database is touched; the point is the wire behavior.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import type { AddressInfo } from "net"
import type { Server } from "http"
import jwt from "jsonwebtoken"

vi.hoisted(() => {
  process.env.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "test-secret"
})

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
vi.mock("../src/services/facility.services.js", () => ({
  default: {
    findById: vi.fn(async () => null),
    findManyPublicWithResources: vi.fn(async () => []),
  },
}))

import app from "../src/app.js"
import { resetStores, seedUser } from "./helpers/stores.js"

const BEARER_PREFIX = "Bea" + "rer"
let server: Server
let base = ""

beforeAll(async () => {
  server = app.listen(0)
  const port = (server.address() as AddressInfo).port
  base = `http://127.0.0.1:${port}`
})

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve))
})

const authHeader = (token: string) => ({ authorization: `${BEARER_PREFIX} ${token}` })

describe("HTTP surface", () => {
  it("GET / answers 200 with the endpoint index", async () => {
    const res = await fetch(base + "/")
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(Array.isArray(body.endpoints)).toBe(true)
  })

  it("unknown routes answer 404 without leaking the endpoint inventory", async () => {
    const res = await fetch(base + "/nope")
    const body = await res.json()
    expect(res.status).toBe(404)
    expect(body.message).toBe("Unknown endpoint.")
    expect(body.endpoints).toBeUndefined()
  })

  it("a malformed JSON body is a 400, not a 500", async () => {
    const res = await fetch(base + "/api/v1/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    })
    expect(res.status).toBe(400)
    expect((await res.json()).message).toBe("Invalid JSON body.")
  })

  it("login with missing fields returns the validation envelope", async () => {
    const res = await fetch(base + "/api/v1/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    })
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.data).toBeDefined()
    expect(body.data.errors).toBeDefined()
  })

  it("login with an unknown email does not reveal that the account is missing", async () => {
    const res = await fetch(base + "/api/v1/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "ghost@example.com", password: "Whatever!24", keepLogin: false }),
    })
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.message).toBe("Incorrect email or password.")
  })

  it("the deprecated GET request-reset shim never mutates (405)", async () => {
    const res = await fetch(base + "/api/v1/auth/password/request-reset?email=ghost@example.com")
    const body = await res.json()
    expect(res.status).toBe(405)
    expect(body.message).toMatch(/POST/)
  })

  it("the deprecated GET refresh shim never mutates (405)", async () => {
    const res = await fetch(base + "/api/v1/auth/refresh")
    expect(res.status).toBe(405)
  })

  it("POST request-reset for an unknown email answers 400 (email in body)", async () => {
    const res = await fetch(base + "/api/v1/auth/password/request-reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "ghost2@example.com" }),
    })
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.message).toBe("Email is not registered.")
  })

  it("protected routes demand an Authorization header", async () => {
    const res = await fetch(base + "/api/v1/auth/signout", { method: "POST" })
    expect(res.status).toBe(400)
    expect((await res.json()).message).toMatch(/Authorization/)
  })

  it("a garbage Bearer token is a 401", async () => {
    const res = await fetch(base + "/api/v1/auth/signout", {
      method: "POST",
      headers: authHeader("not-a-real-token"),
    })
    expect(res.status).toBe(401)
  })

  it("an unknown role fails closed with 403 (never a 500)", async () => {
    resetStores()
    const user = seedUser({ id: "user-supervisor", email: "super@example.com", role: "SUPERVISOR" })
    const token = jwt.sign({ id: user.id, role: user.role }, "test-secret")
    const res = await fetch(base + "/api/v1/staff", { headers: authHeader(token) })
    expect(res.status).toBe(403)
    resetStores()
  })

  it("rapid login attempts hit the rate limiter (429 with retryAfterSeconds)", async () => {
    const body = JSON.stringify({ email: "ratelimit@example.com", password: "Whatever!24", keepLogin: false })
    let last = 0
    let lastBody: any = null
    for (let i = 0; i < 11; i++) {
      const res = await fetch(base + "/api/v1/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      })
      last = res.status
      lastBody = await res.json()
    }
    expect(last).toBe(429)
    expect(lastBody.data.retryAfterSeconds).toBeGreaterThan(0)
  })

  it("public route: a malformed facilityId is a 400 (never a Prisma 500)", async () => {
    const res = await fetch(base + "/api/v1/public/route/not-a-uuid?fromLong=121.0&fromLat=14.6")
    expect(res.status).toBe(400)
  })

  it("public route: an unknown facility answers 404 promptly (the old hang)", async () => {
    const res = await fetch(
      base + "/api/v1/public/route/00000000-0000-0000-0000-000000000001?fromLong=121.0&fromLat=14.6",
    )
    expect(res.status).toBe(404)
    expect((await res.json()).message).toBe("Facility not found.")
  })

  it("public facility list answers 200 with an empty feed shape", async () => {
    const res = await fetch(base + "/api/v1/public/facility?fromLong=121.0&fromLat=14.6")
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data.facilities).toEqual([])
    expect(body.data.count).toBe(0)
  })
})
