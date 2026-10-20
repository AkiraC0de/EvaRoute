import Button from "../../../components/ui/Button";
import TextField from "../../../components/ui/Field";

/**
 * Step 1 of the reset flow — request an OTP for an email account.
 * Calls GET /api/v1/auth/password/request-reset?email=…
 */
const ResetRequestStep = ({ email, onEmailChange, onSubmit, busy }) => (
  <form onSubmit={onSubmit} className="space-y-3">
    <TextField
      label="Email"
      type="email"
      name="email"
      autoComplete="username"
      required
      value={email}
      onChange={(event) => onEmailChange(event.target.value)}
      placeholder="you@example.com"
    />
    <p className="text-[11px] leading-relaxed text-muted-dim">
      We'll email you a 5-digit code. The code is valid for 15 minutes.
    </p>
    <Button type="submit" disabled={busy} className="min-h-11 w-full">
      {busy ? "Sending code…" : "Send reset code"}
    </Button>
  </form>
);

export default ResetRequestStep;
