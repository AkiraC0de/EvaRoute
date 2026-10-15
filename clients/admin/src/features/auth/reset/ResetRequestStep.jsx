/**
 * Step 1 of the reset flow — request an OTP for an email account.
 * Calls GET /api/v1/auth/password/request-reset?email=…
 */
const ResetRequestStep = ({ email, onEmailChange, onSubmit, busy }) => (
  <form onSubmit={onSubmit} className="space-y-3">
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
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="you@example.com"
        className="h-10 w-full rounded-xl bg-[#f6f8fc] px-3 text-[11px] font-medium text-[#2f3d5f] shadow-[inset_0_2px_5px_rgba(40,55,90,0.12)] outline-none ring-[#5269ef] placeholder:text-[#9aa4b8] focus:ring-2"
      />
    </label>
    <p className="text-[9px] leading-relaxed text-[#9aa4b8]">
      We'll email you a 5-digit code. The code is valid for 15 minutes.
    </p>
    <button
      type="submit"
      disabled={busy}
      className="min-h-10 w-full rounded-xl bg-[#5269ef] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#4058df] disabled:cursor-not-allowed disabled:bg-[#aeb9ee]"
    >
      {busy ? "Sending code…" : "Send reset code"}
    </button>
  </form>
);

export default ResetRequestStep;
