import Button from "../../../components/ui/Button";
import PasswordInput from "../../../components/ui/PasswordInput";
import PasswordRulesChecklist from "../../auth/reset/PasswordRulesChecklist";

/** Pure form: three password fields + the live rules checklist. */
const ChangePasswordForm = ({ values, onChange, onSubmit, busy }) => (
  <form onSubmit={onSubmit} className="rounded-2xl bg-sunken p-3 shadow-clay-inset">
    <div className="grid gap-2.5">
      <PasswordInput
        id="current-password"
        name="currentPassword"
        label="Current password"
        autoComplete="current-password"
        value={values.currentPassword}
        onChange={(event) => onChange("currentPassword", event.target.value)}
        placeholder="Enter your current password"
      />
      <PasswordInput
        id="profile-new-password"
        name="newPassword"
        label="New password"
        autoComplete="new-password"
        value={values.newPassword}
        onChange={(event) => onChange("newPassword", event.target.value)}
        placeholder="Enter a new password"
      />
      <PasswordInput
        id="profile-confirm-password"
        name="confirmPassword"
        label="Confirm new password"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={(event) => onChange("confirmPassword", event.target.value)}
        placeholder="Repeat the new password"
      />
    </div>
    <PasswordRulesChecklist password={values.newPassword} />
    <p className="mt-2 text-[10px] text-muted">
      This device stays signed in; every other device is signed out.
    </p>
    <div className="mt-3 flex gap-2">
      <Button
        type="submit"
        size="sm"
        disabled={busy || !values.currentPassword || !values.newPassword}
      >
        {busy ? "Saving…" : "Change password"}
      </Button>
    </div>
  </form>
);

export default ChangePasswordForm;
