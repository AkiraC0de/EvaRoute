import { useState } from "react";
import BrandPanel from "./BrandPanel";
import SignInForm from "./SignInForm";
import ResetPasswordFlow from "./reset/ResetPasswordFlow";

/**
 * Sign-in screen for the staff portal — the claymorphism reference for the
 * whole admin app (pale canvas, white raised card, recessed fields).
 *
 * Split layout: a brand panel (EvaRoute identity) and the auth card, which
 * switches between sign-in and the password-reset flow.
 */
const LoginPage = () => {
  const [view, setView] = useState("signin"); // "signin" | "reset"

  return (
    <main className="flex min-h-screen bg-canvas">
      <BrandPanel />

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-100">
          {/* Compact header for small screens (BrandPanel is lg-only) */}
          <div className="mb-5 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-clay-sm bg-surface shadow-clay-xs">
              <img src="./evaRouteLogo.png" alt="EvaRoute logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-ink">EvaRoute</p>
              <p className="text-[8px] font-semibold uppercase tracking-[1.5px] text-muted-dim">
                Staff Portal
              </p>
            </div>
          </div>

          <div className="rounded-clay bg-surface p-6 shadow-clay">
            {view === "reset" ? (
              <>
                <h2 className="text-[15px] font-bold text-ink">
                  Reset your password
                </h2>
                <p className="mb-5 mt-1 text-[11px] text-muted">
                  Follow the three steps to get back into your account.
                </p>
                <ResetPasswordFlow onBackToSignIn={() => setView("signin")} />
              </>
            ) : (
              <SignInForm onForgotPassword={() => setView("reset")} />
            )}
          </div>

          <p className="mt-4 text-center text-[8px] font-medium uppercase tracking-[1.5px] text-muted-dim lg:hidden">
            Evacuation center operations
          </p>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
