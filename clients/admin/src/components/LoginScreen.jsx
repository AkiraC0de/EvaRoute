import { useState } from "react";
import logo from "../assets/EvaRoute Logo.png";
import { useAuth } from "../state/auth-context";

/**
 * Sign-in screen for the staff portal.
 *
 * The portal previously rendered straight into the dashboard with a hardcoded
 * identity. Every staff API route sits behind
 * `verifyAuthentication` (server/src/middlewares/verifyAuthentication.ts), so
 * there is no way to show real data without a real access token — this screen
 * is the prerequisite for the integration, not a new feature.
 *
 * Contract: POST /api/v1/auth/login, body { email, password, keepLogin }.
 * `keepLogin` is required by `loginSchema` (it is not optional server-side).
 */
const LoginScreen = () => {
  const { signIn, sessionMessage } = useAuth();
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
    <main className="flex min-h-screen items-center justify-center bg-[#e9edf7] p-4">
      <div className="w-full max-w-[380px] rounded-[20px] bg-white p-6 shadow-[0_8px_20px_rgba(40,60,100,0.08)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm">
            <img src={logo} alt="EvaRoute logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#273556]">EvaRoute</h1>
            <p className="text-[8px] font-medium tracking-[1px] text-[#9ba5bb]">
              STAFF PORTAL
            </p>
          </div>
        </div>

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

          <label className="block">
            <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.7px] text-[#7f8eae]">
              Password
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-10 w-full rounded-xl bg-[#f6f8fc] px-3 text-[11px] font-medium text-[#2f3d5f] shadow-[inset_0_2px_5px_rgba(40,55,90,0.12)] outline-none ring-[#5269ef] focus:ring-2"
            />
          </label>

          <label className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              checked={keepLogin}
              onChange={(event) => setKeepLogin(event.target.checked)}
              className="h-3.5 w-3.5 rounded accent-[#5269ef]"
            />
            <span className="text-[10px] font-medium text-[#65718c]">
              Keep me signed in on this device
            </span>
          </label>

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

        <p className="mt-4 text-[9px] leading-relaxed text-[#9aa4b8]">
          Forgot your password? Password resets use an email OTP flow that is not
          wired into this portal yet — ask your administrator to reset it.
        </p>
      </div>
    </main>
  );
};

export default LoginScreen;
