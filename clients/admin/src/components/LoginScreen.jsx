import { useState } from "react";
import { useAuth } from "../state/auth-context";
import PasswordInput from "./PasswordInput";
import ResetPasswordFlow from "./ResetPasswordFlow";

/**
 * Sign-in screen for the staff portal.
 *
 * Split layout: a brand panel (EvaRoute identity — the route-to-safety motif)
 * and the auth card, which switches between sign-in and the password-reset
 * flow (ResetPasswordFlow, which mirrors the server's 3-step OTP contract).
 *
 * Contract: POST /api/v1/auth/login, body { email, password, keepLogin }.
 * `keepLogin` is required by `loginSchema` (it is not optional server-side).
 */
const LoginScreen = () => {
  const { signIn, sessionMessage } = useAuth();
  const [view, setView] = useState("signin"); // "signin" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLogin, setKeepLogin] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signIn({ email, password, keepLogin });
    } catch (err) {
      setError(err.message || "Sign in failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-[#e9edf7]">
      {/*
        Brand panel. The logo asset is designed for light backgrounds, so the
        panel stays in the portal's pale-blue family instead of going dark.
        The dashed route line + pins echo the map motif in the logo.
      */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#dfe7fa] via-[#e9edf7] to-[#cfd9f4] p-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_8px_20px_rgba(40,60,100,0.12)]">
            <img src="./evaRouteLogo.png" alt="EvaRoute logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-[17px] font-bold tracking-[0.3px] text-[#273556]">EvaRoute</p>
            <p className="text-[8px] font-semibold uppercase tracking-[2px] text-[#8290aa]">
              Staff Portal
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="max-w-[380px] text-[28px] font-bold leading-[1.15] text-[#273556]">
            Every family,
            <br />
            routed to safety.
          </h1>
          <p className="mt-3 max-w-[340px] text-[11px] leading-relaxed text-[#65718c]">
            Manage your evacuation center in one place — capacity, evacuee
            check-ins, supplies, and staff. Built for the people who keep
            families safe when it matters most.
          </p>

          <ul className="mt-6 space-y-2.5">
            {[
              ["Live occupancy", "Track families, adults, and children against capacity."],
              ["Evacuee check-in", "Record every family member — no paperwork lost."],
              ["Resource control", "Know exactly what your center has left."],
            ].map(([title, caption]) => (
              <li key={title} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#5269ef]">
                  <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <div>
                  <p className="text-[10px] font-bold text-[#35405e]">{title}</p>
                  <p className="text-[9px] leading-relaxed text-[#8290aa]">{caption}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/*
          Decorative route: a winding dashed path between two map pins —
          "your route to safety", drawn to match the logo's navigation motif.
        */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-6 left-0 w-full opacity-25"
          height="190"
          viewBox="0 0 520 190"
          fill="none"
        >
          <path
            d="M-10 160 C 80 150, 90 90, 170 92 S 280 130, 340 84 S 440 36, 530 46"
            stroke="#5269ef"
            strokeWidth="2.5"
            strokeDasharray="7 9"
            strokeLinecap="round"
          />
          <g transform="translate(30,132)">
            <circle cx="12" cy="12" r="11" fill="#5269ef" opacity="0.25" />
            <circle cx="12" cy="12" r="5.5" fill="#5269ef" />
          </g>
          <g transform="translate(478,22)">
            <path
              d="M12 0C5.4 0 0 5.4 0 12c0 9 12 22 12 22s12-13 12-22C24 5.4 18.6 0 12 0z"
              fill="#5269ef"
            />
            <circle cx="12" cy="12" r="5" fill="#e9edf7" />
          </g>
        </svg>

        <p className="relative z-10 text-[8px] font-medium uppercase tracking-[1.5px] text-[#9aa4b8]">
          Evacuation center operations
        </p>
      </aside>

      {/* Auth column */}
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-[400px]">
          {/* Compact header for small screens (the panel above is lg-only) */}
          <div className="mb-5 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
              <img src="./evaRouteLogo.png" alt="EvaRoute logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#273556]">EvaRoute</p>
              <p className="text-[8px] font-semibold uppercase tracking-[1.5px] text-[#9ba5bb]">
                Staff Portal
              </p>
            </div>
          </div>

          <div className="rounded-[20px] bg-white p-6 shadow-[0_8px_20px_rgba(40,60,100,0.08)]">
            {view === "reset" ? (
              <>
                <h2 className="text-[15px] font-bold text-[#273556]">
                  Reset your password
                </h2>
                <p className="mb-5 mt-1 text-[11px] text-[#8290aa]">
                  Follow the three steps to get back into your account.
                </p>
                <ResetPasswordFlow onBackToSignIn={() => { setView("signin"); setError(""); }} />
              </>
            ) : (
              <>
                <h2 className="text-[15px] font-bold text-[#273556]">Sign in</h2>
                <p className="mt-1 text-[11px] text-[#8290aa]">
                  Use the staff account issued by your administrator.
                </p>

                {sessionMessage && (
                  <p
                    role="status"
                    className="mt-4 rounded-xl bg-[#fff3d9] px-3 py-2 text-[10px] font-medium text-[#a96a00]"
                  >
                    {sessionMessage}
                  </p>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
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

                  <PasswordInput
                    id="signin-password"
                    name="password"
                    label="Password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={keepLogin}
                        onChange={(event) => setKeepLogin(event.target.checked)}
                        className="h-3.5 w-3.5 rounded accent-[#5269ef]"
                      />
                      <span className="text-[10px] font-medium text-[#65718c]">
                        Keep me signed in
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setView("reset");
                        setError("");
                      }}
                      className="text-[9px] font-semibold text-[#5269ef] transition hover:text-[#4058df]"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="rounded-xl bg-[#fbe4e3] px-3 py-2 text-[10px] font-semibold text-[#d8322d]"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 min-h-10 w-full rounded-xl bg-[#5269ef] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#4058df] disabled:cursor-not-allowed disabled:bg-[#aeb9ee]"
                  >
                    {submitting ? "Signing in…" : "Sign in"}
                  </button>
                </form>

                <p className="mt-4 border-t border-[#eef1f8] pt-3 text-[9px] leading-relaxed text-[#9aa4b8]">
                  Need an account? Staff accounts are created by an
                  administrator — contact your coordinator to get access.
                </p>
              </>
            )}
          </div>

          <p className="mt-4 text-center text-[8px] font-medium uppercase tracking-[1.5px] text-[#9aa4b8] lg:hidden">
            Evacuation center operations
          </p>
        </div>
      </div>
    </main>
  );
};

export default LoginScreen;
