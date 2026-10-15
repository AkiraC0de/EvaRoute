import { useState } from "react";
import * as api from "../lib/api";
import PasswordInput from "./PasswordInput";

/**
 * Password reset flow — mirrors the server contract exactly
 * (server/src/routes/auth.routes.ts):
 *
 *   1. GET  /auth/password/request-reset?email=…  -> { token } + OTP email
 *   2. POST /auth/password/verify-reset  (Bearer token from step 1, { otp })
 *      -> { token } — a NEW token for step 3
 *   3. POST /auth/password/reset  (Bearer token from step 2, { newPassword })
 *      -> done; every device is signed out server-side
 *
 * The two tokens are single-use and expire after 15 minutes
 * (REQ_RESET_PASS_TOKEN / RESET_PASS_TOKEN in tokenConfig.ts), so a 401 at
 * any point means "start over" rather than "retry".
 */

const STEPS = [
  { key: "email", label: "Email" },
  { key: "otp", label: "Verify code" },
  { key: "password", label: "New password" },
];

const NEW_PASSWORD_RULES = [
  { test: (value) => value.length >= 8, label: "At least 8 characters" },
  { test: (value) => /[a-z]/.test(value), label: "One lowercase letter" },
  { test: (value) => /[A-Z]/.test(value), label: "One uppercase letter" },
  { test: (value) => /\d/.test(value), label: "One number" },
  {
    test: (value) => /[@$!%*?&]/.test(value),
    label: "One special character (@$!%*?&)",
  },
];

const ResetPasswordFlow = ({ onBackToSignIn }) => {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requestToken, setRequestToken] = useState(""); // raw token from step 1
  const [resetToken, setResetToken] = useState(""); // raw token from step 2
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const stepIndex = STEPS.findIndex((entry) => entry.key === step);

  const restart = () => {
    setStep("email");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setRequestToken("");
    setResetToken("");
  };

  const failWith = (err, fallback) => {
    if (err.status === 401) {
      // The single-use token died (expired or already consumed): the flow has
      // to start from the top, the server keeps no session for it.
      setError("This reset session has expired. Please request a new code.");
      restart();
      return;
    }
    setError(err.message || fallback);
  };

  // Step 1 — request the OTP
  const handleRequest = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const data = await api.requestPasswordReset(email.trim());
      setRequestToken(data.token);
      setStep("otp");
      setNotice(data.message || "We've sent a 5-digit code to your email.");
    } catch (err) {
      failWith(err, "Could not request a reset code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Re-request a code for the same email (new token + fresh attempt budget)
  const handleResend = async () => {
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const data = await api.requestPasswordReset(email.trim());
      setRequestToken(data.token);
      setOtp("");
      setNotice("A new code has been sent to your email.");
    } catch (err) {
      failWith(err, "Could not resend the code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2 — verify the emailed OTP
  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const data = await api.verifyResetOtp(requestToken, otp.trim());
      setResetToken(data.token);
      setStep("password");
    } catch (err) {
      // 400 carries { attempts, remainingAttempts } — surface the budget so
      // the user knows when a resend becomes mandatory.
      const remaining = err.details?.remainingAttempts;
      const suffix =
        typeof remaining === "number" && remaining > 0
          ? ` ${remaining} attempt${remaining === 1 ? "" : "s"} left.`
          : "";
      failWith(err, "Could not verify the code.");
      setError((current) => (current ? `${current}${suffix}` : current));
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3 — set the new password
  const handleReset = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await api.resetPassword(resetToken, newPassword);
      setDone(true);
      setNotice(data.message);
    } catch (err) {
      // 400 from passResetSchema carries field-level rule violations.
      const fieldErrors = err.details?.errors;
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        setError(fieldErrors.map((entry) => entry.message).join(" "));
        return;
      }
      failWith(err, "Could not reset the password.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div>
        <div
          role="status"
          className="rounded-xl bg-[#e2f4e8] px-3 py-3 text-[10px] font-medium leading-relaxed text-[#1f7a3d]"
        >
          {notice || "Your password has been changed."}
        </div>
        <button
          type="button"
          onClick={onBackToSignIn}
          className="mt-5 min-h-10 w-full rounded-xl bg-[#5269ef] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#4058df]"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Progress: Email -> Verify code -> New password */}
      <ol className="mb-5 flex items-center gap-2">
        {STEPS.map((entry, index) => {
          const state =
            index < stepIndex ? "done" : index === stepIndex ? "current" : "todo";
          return (
            <li key={entry.key} className="flex flex-1 flex-col gap-1">
              <span
                className={`h-1 rounded-full ${
                  state === "todo" ? "bg-[#e3e8f4]" : "bg-[#5269ef]"
                }`}
              />
              <span
                className={`text-[8px] font-semibold uppercase tracking-[0.6px] ${
                  state === "current"
                    ? "text-[#5269ef]"
                    : state === "done"
                      ? "text-[#8290aa]"
                      : "text-[#b3bccd]"
                }`}
              >
                {index + 1}. {entry.label}
              </span>
            </li>
          );
        })}
      </ol>

      {notice && (
        <p
          role="status"
          className="mb-3 rounded-xl bg-[#fff3d9] px-3 py-2 text-[10px] font-medium text-[#a96a00]"
        >
          {notice}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-[#fbe4e3] px-3 py-2 text-[10px] font-semibold text-[#d8322d]"
        >
          {error}
        </p>
      )}

      {step === "email" && (
        <form onSubmit={handleRequest} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.7px] text-[#7f8eae]">
              Email
            </span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-10 w-full rounded-xl bg-[#f6f8fc] px-3 text-[11px] font-medium text-[#2f3d5f] shadow-[inset_0_2px_5px_rgba(40,55,90,0.12)] outline-none ring-[#5269ef] placeholder:text-[#9aa4b8] focus:ring-2"
            />
          </label>
          <p className="text-[9px] leading-relaxed text-[#9aa4b8]">
            We'll email you a 5-digit code. The code is valid for 15 minutes.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-10 w-full rounded-xl bg-[#5269ef] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#4058df] disabled:cursor-not-allowed disabled:bg-[#aeb9ee]"
          >
            {submitting ? "Sending code…" : "Send reset code"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerify} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.7px] text-[#7f8eae]">
              Verification code
            </span>
            <input
              type="text"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={5}
              pattern="\d{5}"
              title="Enter the 5-digit code from your email."
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 5))
              }
              placeholder="12345"
              className="h-10 w-full rounded-xl bg-[#f6f8fc] px-3 text-center text-[16px] font-bold tracking-[8px] text-[#2f3d5f] shadow-[inset_0_2px_5px_rgba(40,55,90,0.12)] outline-none ring-[#5269ef] placeholder:text-[#c2cada] focus:ring-2"
            />
          </label>
          <p className="text-[9px] leading-relaxed text-[#9aa4b8]">
            Enter the 5-digit code sent to{" "}
            <span className="font-semibold text-[#65718c]">{email}</span>. Wrong
            codes are limited — resend if you run out.
          </p>
          <button
            type="submit"
            disabled={submitting || otp.length !== 5}
            className="min-h-10 w-full rounded-xl bg-[#5269ef] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#4058df] disabled:cursor-not-allowed disabled:bg-[#aeb9ee]"
          >
            {submitting ? "Verifying…" : "Verify code"}
          </button>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={submitting}
              className="text-[9px] font-semibold text-[#5269ef] transition hover:text-[#4058df] disabled:text-[#aeb9ee]"
            >
              Resend code
            </button>
            <button
              type="button"
              onClick={() => {
                restart();
                setError("");
                setNotice("");
              }}
              className="text-[9px] font-semibold text-[#8290aa] transition hover:text-[#5269ef]"
            >
              Use a different email
            </button>
          </div>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={handleReset} className="space-y-3">
          <PasswordInput
            id="new-password"
            name="newPassword"
            label="New password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Enter a new password"
          />
          <PasswordInput
            id="confirm-password"
            name="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat the new password"
          />

          {/* Live checklist mirrors passResetSchema on the server */}
          <ul className="grid grid-cols-2 gap-x-2 gap-y-1 rounded-xl bg-[#f6f8fc] px-3 py-2">
            {NEW_PASSWORD_RULES.map((rule) => {
              const met = rule.test(newPassword);
              return (
                <li
                  key={rule.label}
                  className={`flex items-center gap-1.5 text-[8px] font-medium ${
                    met ? "text-[#1f7a3d]" : "text-[#8290aa]"
                  }`}
                >
                  <span aria-hidden="true" className="flex h-3 w-3 items-center justify-center rounded-full text-[7px] font-bold text-white" style={{ background: met ? "#3fa35f" : "#c2cada" }}>
                    {met ? "✓" : ""}
                  </span>
                  {rule.label}
                </li>
              );
            })}
          </ul>

          <p className="text-[9px] leading-relaxed text-[#9aa4b8]">
            Changing your password signs you out of every device, including this
            one.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-10 w-full rounded-xl bg-[#5269ef] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#4058df] disabled:cursor-not-allowed disabled:bg-[#aeb9ee]"
          >
            {submitting ? "Saving…" : "Reset password"}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={onBackToSignIn}
        className="mt-4 w-full text-center text-[9px] font-semibold text-[#8290aa] transition hover:text-[#5269ef]"
      >
        ← Back to sign in
      </button>
    </div>
  );
};

export default ResetPasswordFlow;
