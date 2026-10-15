import { useState } from "react";
import Banner from "../../components/ui/Banner";
import PasswordInput from "../../components/ui/PasswordInput";
import { useAuth } from "../../context/AuthContext";

/**
 * Sign-in form.
 *
 * Contract: POST /api/v1/auth/login, body { email, password, keepLogin }.
 * `keepLogin` is required by `loginSchema` (it is not optional server-side).
 */
const SignInForm = ({ onForgotPassword }) => {
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
    <>
      <h2 className="text-3xl font-bold text-[#273556]">Sign in</h2>
      <p className="mt-1 text-xs text-[#8290aa]">
        Use the staff account issued by your administrator.
      </p>

      {sessionMessage && (
        <div className="mt-4">
          <Banner tone="warning">{sessionMessage}</Banner>
        </div>
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
            onClick={onForgotPassword}
            className="text-[9px] font-semibold text-[#5269ef] transition hover:text-[#4058df]"
          >
            Forgot password?
          </button>
        </div>

        {error && <Banner tone="error">{error}</Banner>}

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
  );
};

export default SignInForm;
