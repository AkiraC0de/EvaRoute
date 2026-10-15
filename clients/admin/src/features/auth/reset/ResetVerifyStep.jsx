/**
 * Step 2 of the reset flow — verify the 5-digit OTP.
 * Calls POST /api/v1/auth/password/verify-reset (Bearer token from step 1).
 * Wrong codes are limited server-side (10 attempts); resend issues a fresh
 * token and a fresh attempt budget.
 */
const ResetVerifyStep = ({ email, otp, onOtpChange, onSubmit, onResend, onRestart, busy }) => (
  <form onSubmit={onSubmit} className="space-y-3">
    <label className="block">
      <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.7px] text-[#7f8eae]">
        Verification code
      </span>
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
        className="h-10 w-full rounded-xl bg-[#f6f8fc] px-3 text-center text-[16px] font-bold tracking-[8px] text-[#2f3d5f] shadow-[inset_0_2px_5px_rgba(40,55,90,0.12)] outline-none ring-[#5269ef] placeholder:text-[#c2cada] focus:ring-2"
      />
    </label>
    <p className="text-[9px] leading-relaxed text-[#9aa4b8]">
      Enter the 5-digit code sent to{" "}
      <span className="font-semibold text-[#65718c]">{email}</span>. Wrong
      codes are limited — resend if you run out.
    </p>
    <button
      type="submit"
      disabled={busy || otp.length !== 5}
      className="min-h-10 w-full rounded-xl bg-[#5269ef] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#4058df] disabled:cursor-not-allowed disabled:bg-[#aeb9ee]"
    >
      {busy ? "Verifying…" : "Verify code"}
    </button>
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={onResend}
        disabled={busy}
        className="text-[9px] font-semibold text-[#5269ef] transition hover:text-[#4058df] disabled:text-[#aeb9ee]"
      >
        Resend code
      </button>
      <button
        type="button"
        onClick={onRestart}
        className="text-[9px] font-semibold text-[#8290aa] transition hover:text-[#5269ef]"
      >
        Use a different email
      </button>
    </div>
  </form>
);

export default ResetVerifyStep;
