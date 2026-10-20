import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Banner from "../../components/ui/Banner";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";
import TextField from "../../components/ui/Field";
import PasswordInput from "../../components/ui/PasswordInput";
import { useAuth } from "../../context/AuthContext";
import { authVariants } from "./authMotion";

/**
 * Sign-in form.
 *
 * Contract: POST /api/v1/auth/login, body { email, password, keepLogin }.
 * `keepLogin` is required by `loginSchema` (it is not optional server-side).
 *
 * The fields cascade in (shared authMotion stagger) so the card feels
 * assembled rather than popped in.
 */
const SignInForm = ({ onForgotPassword }) => {
  const { signIn, sessionMessage } = useAuth();
  const reduce = useReducedMotion();
  const v = authVariants(reduce);
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
      <motion.p
        variants={v.fadeUp}
        className="text-[10px] font-semibold uppercase tracking-[1.5px] text-primary"
      >
        Secure access
      </motion.p>
      <motion.h2 variants={v.fadeUp} className="mt-1.5 text-[30px] font-bold leading-tight text-ink">
        Welcome back
      </motion.h2>
      <motion.p variants={v.fadeUp} className="mt-1.5 text-[13px] leading-relaxed text-muted">
        Sign in with the staff account issued by your administrator.
      </motion.p>

      {sessionMessage && (
        <motion.div variants={v.fadeUp} className="mt-4">
          <Banner tone="warning">{sessionMessage}</Banner>
        </motion.div>
      )}

      <motion.form onSubmit={handleSubmit} variants={v.stagger} className="mt-4 space-y-3">
        <motion.div variants={v.fadeUp}>
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
        </motion.div>

        <motion.div variants={v.fadeUp}>
          <PasswordInput
            id="signin-password"
            name="password"
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />
        </motion.div>

        <motion.div variants={v.fadeUp} className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={keepLogin}
              onChange={(event) => setKeepLogin(event.target.checked)}
              ariaLabel="Keep me signed in"
            />
            <span className="text-[12px] font-medium text-muted">
              Keep me signed in
            </span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="inline-flex min-h-11 items-center text-[11px] font-semibold text-primary transition hover:text-primary-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Forgot password?
          </button>
        </motion.div>

        {error && (
          <motion.div variants={v.fadeUp}>
            <Banner tone="error">{error}</Banner>
          </motion.div>
        )}

        <motion.div variants={v.fadeUp}>
          <Button type="submit" disabled={submitting} className="mt-2 min-h-11 w-full">
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </motion.div>
      </motion.form>

      <motion.p
        variants={v.fadeUp}
        className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-muted-dim"
      >
        Need an account? Staff accounts are created by an
        administrator — contact your coordinator to get access.
      </motion.p>
    </>
  );
};

export default SignInForm;
