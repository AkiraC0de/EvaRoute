import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import BrandPanel from "./BrandPanel";
import SignInForm from "./SignInForm";
import ResetPasswordFlow from "./reset/ResetPasswordFlow";
import { authVariants } from "./authMotion";

/**
 * Sign-in screen for the staff portal — the flat "Operations Console"
 * language for the whole admin app (warm canvas, white bordered card,
 * flat hairline fields).
 *
 * Split layout: a brand panel (EvaRoute identity) and the auth card, which
 * switches between sign-in and the password-reset flow with a directional
 * slide (forward into reset, back to sign-in). The card contents cascade in
 * on first paint.
 */
const LoginPage = () => {
  const [view, setView] = useState("signin"); // "signin" | "reset"
  const reduce = useReducedMotion();
  const v = authVariants(reduce);

  return (
    <main className="relative min-h-screen overflow-hidden bg-canvas lg:grid lg:grid-cols-[1.12fr_1fr]">
      <BrandPanel />

      {/* Form pane — plain warm canvas; the bordered white card is the
          single focal surface (flat language: border + fill, no glows). */}
      <div className="relative flex items-center justify-center p-4">
        <motion.div
          variants={v.stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 w-full max-w-100 py-10"
        >
          {/* Compact header for small screens (BrandPanel is lg-only) */}
          <motion.div variants={v.fadeUp} className="mb-5 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-surface">
              <img src="./evaRouteLogo.png" alt="EvaRoute logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-ink">EvaRoute</p>
              <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-dim">
                Staff Portal
              </p>
            </div>
          </motion.div>

          <motion.div variants={v.fadeUp} className="rounded-xl border border-line bg-surface p-6">
            <AnimatePresence mode="wait">
              {view === "reset" ? (
                <motion.div
                  key="reset"
                  variants={v.panel(1)}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  <h2 className="text-[17px] font-bold text-ink">Reset your password</h2>
                  <p className="mb-5 mt-1 text-[13px] text-muted">
                    Follow the three steps to get back into your account.
                  </p>
                  <ResetPasswordFlow onBackToSignIn={() => setView("signin")} />
                </motion.div>
              ) : (
                <motion.div
                  key="signin"
                  variants={v.panel(-1)}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  <SignInForm onForgotPassword={() => setView("reset")} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.p
            variants={v.fadeUp}
            className="mt-4 text-center text-[10px] font-medium uppercase tracking-[1.5px] text-muted-dim lg:hidden"
          >
            Evacuation center operations
          </motion.p>
        </motion.div>
      </div>
    </main>
  );
};

export default LoginPage;
