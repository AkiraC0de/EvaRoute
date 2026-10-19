/**
 * Password strength rules mirroring `newPasswordField` in
 * server/src/validations/auth.validations.ts. Purely informational — the
 * server remains the authority on password strength.
 */

export const RULES = [
  { test: (value) => value.length >= 8, label: "At least 8 characters" },
  { test: (value) => /[a-z]/.test(value), label: "One lowercase letter" },
  { test: (value) => /[A-Z]/.test(value), label: "One uppercase letter" },
  { test: (value) => /\d/.test(value), label: "One number" },
  {
    test: (value) => /[@$!%*?&]/.test(value),
    label: "One special character (@$!%*?&)",
  },
];

/** True when every rule above passes — mirrors the server regex exactly. */
export const passwordMeetsRules = (value) =>
  RULES.every((rule) => rule.test(value));
