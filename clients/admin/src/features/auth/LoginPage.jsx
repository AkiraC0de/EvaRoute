import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import BrandPanel from "./BrandPanel";
import SignInForm from "./SignInForm";
import ResetPasswordFlow from "./reset/ResetPasswordFlow";
import { authVariants } from "./authMotion";

/**
 * Sign-in screen for the staff portal — the claymorphism reference for the
 * whole admin app (pale canvas, white raised card, recessed fields).
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

      {/* Form pane — token-based radial glows behind the card (21st
          "Split Login" pattern); the clay card keeps the portal identity. */}
      <div className="relative flex items-center justify-center p-4">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="absolute -right-20 -top-24 h-[440px] w-[440px] rounded-full opacity-85"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, var(--color-accent-soft) 0, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-28 -left-16 h-[360px] w-[360px] rounded-full opacity-75"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, var(--color-accent-soft) 0, transparent 70%)",
            }}
          />
        </div>
        <motion.div
          variants={v.stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 w-full max-w-100 py-10"
        >
          {/* Compact header for small screens (BrandPanel is lg-only) */}
          <motion.div variants={v.fadeUp} className="mb-5 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-clay-sm bg-surface shadow-clay-xs">
              <img src="./evaRouteLogo.png" alt="EvaRoute logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-ink">EvaRoute</p>
              <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-dim">
                Staff Portal
              </p>
            </div>
          </motion.div>

          <motion.div variants={v.fadeUp} className="rounded-clay bg-surface p-6 shadow-clay-lg">
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
