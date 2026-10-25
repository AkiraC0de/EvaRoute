import { useState } from "react";
import * as api from "../../../lib/api";

const STEPS = ["Email", "Verify code", "New password"];
const STEP_ORDER = { email: 0, otp: 1, password: 2 };

/**
 * 3-step password reset state machine, mirroring the server contract exactly:
 *   1. POST /auth/password/request-reset  Body: { email }  -> { token } (REQ_RESET_PASS)
 *   2. POST /auth/password/verify-reset  (Bearer token1 + { otp })
 *        -> { token } (RESET_PASS)
 *   3. POST /auth/password/reset  (Bearer token2 + { newPassword })
 * Tokens are single-use and live 15 minutes; a 401 at any point restarts
 * the flow (the server keeps no session for it).
 */
export default function useResetFlow() {
  const [step, setStep] = useState("email");
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
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

  const stepIndex = STEPS.findIndex((label) =>
    step === "email" ? label === "Email" : step === "otp" ? label === "Verify code" : label === "New password",
  );

  // Step changes carry their direction so the slide reads as forward/back.
  const goTo = (next) => {
    setDirection(STEP_ORDER[next] >= (STEP_ORDER[step] ?? 0) ? 1 : -1);
    setStep(next);
  };

  const restart = () => {
    goTo("email");
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
      goTo("otp");
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
      goTo("password");
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
      setDirection(1);
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

  return {
    steps: STEPS,
    step,
    stepIndex,
    direction,
    done,
    submitting,
    error,
    notice,
    email,
    setEmail,
    otp,
    setOtp,
    newPassword,
    confirmPassword,
    // ResetPasswordStep reports field patches, not raw change events.
    setPasswordFields: (patch) => {
      if (patch.newPassword !== undefined) setNewPassword(patch.newPassword);
      if (patch.confirmPassword !== undefined) setConfirmPassword(patch.confirmPassword);
    },
    handleRequest,
    handleResend,
    handleVerify,
    handleReset,
    // "Use a different email" — back to step 1 with a clean slate.
    handleRestart: () => {
      restart();
      setError("");
      setNotice("");
    },
  };
}
