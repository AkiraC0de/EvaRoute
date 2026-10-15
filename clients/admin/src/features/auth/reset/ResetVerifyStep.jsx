import Button from "../../../components/ui/Button";
import { LABEL_CLASS } from "../../../components/ui/fieldStyles";

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
        className="h-10 w-full rounded-clay-sm bg-sunken px-3 text-center text-[16px] font-bold tracking-[8px] text-[#2f3d5f] shadow-clay-inset outline-none transition placeholder:font-medium placeholder:tracking-[8px] placeholder:text-[#c2cada] hover:bg-[#f2f5fb] ring-accent focus:ring-2"
      />
    </label>
    <p className="text-[9px] leading-relaxed text-muted-dim">
      Enter the 5-digit code sent to{" "}
      <span className="font-semibold text-[#65718c]">{email}</span>. Wrong
      codes are limited — resend if you run out.
    </p>
    <Button type="submit" disabled={busy || otp.length !== 5} className="min-h-10 w-full">
      {busy ? "Verifying…" : "Verify code"}
    </Button>
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={onResend}
        disabled={busy}
        className="text-[9px] font-semibold text-accent transition hover:text-accent-strong disabled:text-[#aeb9ee]"
      >
        Resend code
      </button>
      <button
        type="button"
        onClick={onRestart}
        className="text-[9px] font-semibold text-muted transition hover:text-accent"
      >
        Use a different email
      </button>
    </div>
  </form>
);

export default ResetVerifyStep;
