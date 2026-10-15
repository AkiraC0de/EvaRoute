import PasswordInput from "../../../components/ui/PasswordInput";
import PasswordRulesChecklist from "./PasswordRulesChecklist";

/**
 * Step 3 of the reset flow — choose a new password.
 * Calls POST /api/v1/auth/password/reset (Bearer token from step 2).
 * Client-side the two fields must match; strength rules are enforced
 * server-side and mirrored by the checklist.
 */
const ResetPasswordStep = ({ newPassword, confirmPassword, onChange, onSubmit, busy }) => (
  <form onSubmit={onSubmit} className="space-y-3">
    <PasswordInput
      id="new-password"
      name="newPassword"
      label="New password"
      autoComplete="new-password"
      value={newPassword}
      onChange={(event) => onChange({ newPassword: event.target.value })}
      placeholder="Enter a new password"
    />
    <PasswordInput
      id="confirm-password"
      name="confirmPassword"
      label="Confirm new password"
      autoComplete="new-password"
      value={confirmPassword}
      onChange={(event) => onChange({ confirmPassword: event.target.value })}
      placeholder="Repeat the new password"
    />

    <PasswordRulesChecklist password={newPassword} />

    <p className="text-[9px] leading-relaxed text-[#9aa4b8]">
      Changing your password signs you out of every device, including this
      one.
    </p>
    <button
      type="submit"
      disabled={busy}
      className="min-h-10 w-full rounded-xl bg-[#5269ef] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#4058df] disabled:cursor-not-allowed disabled:bg-[#aeb9ee]"
    >
      {busy ? "Saving…" : "Reset password"}
    </button>
  </form>
);

export default ResetPasswordStep;
