import Button from "../../../components/ui/Button";
import { LABEL_CLASS } from "../../../components/ui/fieldStyles";

/**
 * Flat OTP input chrome — mirrors FIELD_CLASS (white surface, hairline
 * border, primary focus ring) but keeps the code's centered 18px tracked
 * type scale.
 */
const OTP_INPUT_CLASS = [
  "h-11 sm:h-10 w-full rounded-md border border-line-strong bg-surface px-3",
  "text-center text-[18px] font-bold tracking-[8px] text-ink-soft",
  "outline-none transition",
  "placeholder:font-medium placeholder:tracking-[8px] placeholder:text-muted-dim",
  "focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-line-strong",
].join(" ");

/**
 * Step 2 of the reset flow — verify the 5-digit OTP.
 * Calls POST /api/v1/auth/password/verify-reset (Bearer token from step 1).
 * Wrong codes are limited server-side (10 attempts); resend issues a fresh
 * token and a fresh attempt budget.
 */
const ResetVerifyStep = ({ email, otp, onOtpChange, onSubmit, onResend, onRestart, busy }) => (
  <form onSubmit={onSubmit} className="space-y-3">
    <label className="block">
      <span className={LABEL_CLASS}>Verification code</span>
      <input
        type="text"
        name="otp"
        inputMode="numeric"
        autoComplete="one-time-code"
        required
        maxLength={5}
        pattern="\d{5}"
        title="Enter the 5-digit code from your email."
        value={otp}
        onChange={(event) => onOtpChange(event.target.value.replace(/\D/g, "").slice(0, 5))}
        placeholder="12345"
        className={OTP_INPUT_CLASS}
      />
    </label>
    <p className="text-[11px] leading-relaxed text-muted-dim">
      Enter the 5-digit code sent to{" "}
      <span className="font-semibold text-muted">{email}</span>. Wrong
      codes are limited — resend if you run out.
    </p>
    <Button type="submit" disabled={busy || otp.length !== 5} className="min-h-11 w-full">
      {busy ? "Verifying…" : "Verify code"}
    </Button>
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={onResend}
        disabled={busy}
        className="inline-flex min-h-11 items-center text-[11px] font-semibold text-primary transition hover:text-primary-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:text-muted-dim"
      >
        Resend code
      </button>
      <button
        type="button"
        onClick={onRestart}
        className="inline-flex min-h-11 items-center text-[11px] font-semibold text-muted transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Use a different email
      </button>
    </div>
  </form>
);

export default ResetVerifyStep;
