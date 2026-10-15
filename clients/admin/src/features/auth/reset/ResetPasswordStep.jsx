import Button from "../../../components/ui/Button";
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

    <p className="text-[9px] leading-relaxed text-muted-dim">
      Changing your password signs you out of every device, including this
      one.
    </p>
    <Button type="submit" disabled={busy} className="min-h-10 w-full">
      {busy ? "Saving…" : "Reset password"}
    </Button>
  </form>
);

export default ResetPasswordStep;
