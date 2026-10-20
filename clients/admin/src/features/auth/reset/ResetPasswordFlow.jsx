import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Banner from "../../../components/ui/Banner";
import Button from "../../../components/ui/Button";
import StepProgress from "../../../components/ui/StepProgress";
import ResetRequestStep from "./ResetRequestStep";
import ResetVerifyStep from "./ResetVerifyStep";
import ResetPasswordStep from "./ResetPasswordStep";
import useResetFlow from "./useResetFlow";
import { authVariants } from "../authMotion";

/**
 * 3-step password reset UI — render-only orchestration: every piece of flow
 * state and every handler lives in useResetFlow (which mirrors the server
 * contract exactly).
 *
 * Steps slide forward/back with the flow direction (advancing moves the
 * panel in from the right, going back from the left); the success screen
 * joins the same transition. Banners animate in and out.
 */

const ResetPasswordFlow = ({ onBackToSignIn }) => {
  const {
    steps,
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
    setPasswordFields,
    handleRequest,
    handleResend,
    handleVerify,
    handleReset,
    handleRestart,
  } = useResetFlow();
  const reduce = useReducedMotion();
  const v = authVariants(reduce);

  return (
    <div>
      {!done && <StepProgress steps={steps} current={stepIndex} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={done ? "done" : step}
          variants={v.panel(direction)}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          {!done && notice && (
            <div className="mb-3">
              <Banner tone="warning">{notice}</Banner>
            </div>
          )}
          {!done && error && (
            <div className="mb-3">
              <Banner tone="error">{error}</Banner>
            </div>
          )}

          {done && (
            <div>
              <Banner tone="success" className="px-3 py-3 leading-relaxed">
                {notice || "Your password has been changed."}
              </Banner>
              <Button onClick={onBackToSignIn} className="mt-5 min-h-11 w-full">
                Back to sign in
              </Button>
            </div>
          )}

          {!done && step === "email" && (
            <ResetRequestStep
              email={email}
              onEmailChange={setEmail}
              onSubmit={handleRequest}
              busy={submitting}
            />
          )}
          {!done && step === "otp" && (
            <ResetVerifyStep
              email={email}
              otp={otp}
              onOtpChange={setOtp}
              onSubmit={handleVerify}
              onResend={handleResend}
              onRestart={handleRestart}
              busy={submitting}
            />
          )}
          {!done && step === "password" && (
            <ResetPasswordStep
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              onChange={setPasswordFields}
              onSubmit={handleReset}
              busy={submitting}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {!done && (
        <button
          type="button"
          onClick={onBackToSignIn}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center text-center text-[11px] font-semibold text-muted transition hover:text-primary-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
        >
          ← Back to sign in
        </button>
      )}
    </div>
  );
};

export default ResetPasswordFlow;
