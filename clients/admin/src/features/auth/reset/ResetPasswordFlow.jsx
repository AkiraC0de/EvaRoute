import { useState } from "react";
import Banner from "../../../components/ui/Banner";
import StepProgress from "../../../components/ui/StepProgress";
import * as api from "../../../lib/api";
import ResetRequestStep from "./ResetRequestStep";
import ResetVerifyStep from "./ResetVerifyStep";
import ResetPasswordStep from "./ResetPasswordStep";

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
 *
 * This component owns flow state and API calls; each step is a presentational
 * form in its own file.
 */

const STEPS = ["Email", "Verify code", "New password"];

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

  const stepIndex = STEPS.findIndex((label) =>
    step === "email" ? label === "Email" : step === "otp" ? label === "Verify code" : label === "New password",
  );

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
        <Banner tone="success" className="px-3 py-3 leading-relaxed">
          {notice || "Your password has been changed."}
        </Banner>
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
      <StepProgress steps={STEPS} current={stepIndex} />

      {notice && (
        <div className="mb-3">
          <Banner tone="warning">{notice}</Banner>
        </div>
      )}
      {error && (
        <div className="mb-3">
          <Banner tone="error">{error}</Banner>
        </div>
      )}

      {step === "email" && (
        <ResetRequestStep
          email={email}
          onEmailChange={setEmail}
          onSubmit={handleRequest}
          busy={submitting}
        />
      )}

      {step === "otp" && (
        <ResetVerifyStep
          email={email}
          otp={otp}
          onOtpChange={setOtp}
          onSubmit={handleVerify}
          onResend={handleResend}
          onRestart={() => {
            restart();
            setError("");
            setNotice("");
          }}
          busy={submitting}
        />
      )}

      {step === "password" && (
        <ResetPasswordStep
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          onChange={(patch) => {
            if (patch.newPassword !== undefined) setNewPassword(patch.newPassword);
            if (patch.confirmPassword !== undefined) setConfirmPassword(patch.confirmPassword);
          }}
          onSubmit={handleReset}
          busy={submitting}
        />
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
