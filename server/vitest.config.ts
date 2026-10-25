import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // The auth suites hash and compare real bcrypt (cost 12) by design — a
    // single hash+compare pair can exceed vitest's 5s default on slow machines.
    testTimeout: 30_000,
  },
})
