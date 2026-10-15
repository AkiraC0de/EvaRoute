import { useState } from "react";
import Banner from "../../components/ui/Banner";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";
import TextField from "../../components/ui/Field";
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
      <h2 className="text-3xl font-bold text-ink">Sign in</h2>
      <p className="mt-1 text-xs text-muted">
        Use the staff account issued by your administrator.
      </p>

      {sessionMessage && (
        <div className="mt-4">
          <Banner tone="warning">{sessionMessage}</Banner>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />

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
            <Checkbox
              checked={keepLogin}
              onChange={(event) => setKeepLogin(event.target.checked)}
              ariaLabel="Keep me signed in"
            />
            <span className="text-[10px] font-medium text-[#65718c]">
              Keep me signed in
            </span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-[9px] font-semibold text-accent transition hover:text-accent-strong"
          >
            Forgot password?
          </button>
        </div>

        {error && <Banner tone="error">{error}</Banner>}

        <Button type="submit" disabled={submitting} className="mt-2 min-h-10 w-full">
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-4 border-t border-line pt-3 text-[9px] leading-relaxed text-muted-dim">
        Need an account? Staff accounts are created by an
        administrator — contact your coordinator to get access.
      </p>
    </>
  );
};

export default SignInForm;
