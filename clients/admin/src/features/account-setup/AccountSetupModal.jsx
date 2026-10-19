import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import TextField from "../../components/ui/Field";
import PasswordInput from "../../components/ui/PasswordInput";
import Banner from "../../components/ui/Banner";
import PasswordRulesChecklist from "../auth/reset/PasswordRulesChecklist";
import { passwordMeetsRules } from "../auth/reset/passwordRules";

/**
 * First-run account setup dialog — blocking (not dismissible): staff
 * accounts are created with only email + a system-generated password, so
 * the user must supply their name and replace that password before the
 * portal unlocks. "Sign out" is the only escape.
 */
const AccountSetupModal = ({ draft, onDraftChange, onSubmit, onSignOut, busy, error }) => {
  const passwordsMatch =
    draft.newPassword.length > 0 && draft.newPassword === draft.confirmPassword;
  const ready =
    draft.firstName.trim().length > 0 &&
    draft.lastName.trim().length > 0 &&
    passwordMeetsRules(draft.newPassword) &&
    passwordsMatch;

  return (
    <Modal title="Set up your account" dismissible={false} onClose={onSignOut}>
      <p className="mb-3 text-[12px] leading-relaxed text-muted">
        Your account was created with a temporary password. Add your details
        and set a new password to continue to the portal.
      </p>

      {error && (
        <div className="mb-3">
          <Banner tone="error">{error}</Banner>
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (ready) onSubmit();
        }}
        className="space-y-3"
      >
        <TextField
          label="First name"
          value={draft.firstName}
          onChange={(event) => onDraftChange({ ...draft, firstName: event.target.value })}
        />
        <TextField
          label="Last name"
          value={draft.lastName}
          onChange={(event) => onDraftChange({ ...draft, lastName: event.target.value })}
        />
        <PasswordInput
          id="setup-new-password"
          name="newPassword"
          label="New password"
          autoComplete="new-password"
          value={draft.newPassword}
          onChange={(event) => onDraftChange({ ...draft, newPassword: event.target.value })}
          placeholder="Enter a new password"
        />
        <PasswordInput
          id="setup-confirm-password"
          name="confirmPassword"
          label="Confirm new password"
          autoComplete="new-password"
          value={draft.confirmPassword}
          onChange={(event) => onDraftChange({ ...draft, confirmPassword: event.target.value })}
          placeholder="Repeat the new password"
        />
        <PasswordRulesChecklist password={draft.newPassword} />
        {draft.confirmPassword.length > 0 && !passwordsMatch && (
          <p className="text-[10px] font-semibold text-[#b3261e]">
            Passwords do not match.
          </p>
        )}
        <p className="text-[10px] text-muted">
          This device stays signed in; every other device is signed out.
        </p>
        <Button type="submit" disabled={busy || !ready} className="w-full">
          {busy ? "Saving…" : "Complete setup"}
        </Button>
      </form>

      <button
        type="button"
        onClick={onSignOut}
        className="mt-3 w-full text-center text-[11px] font-semibold text-muted transition hover:text-ink-soft"
      >
        Sign out instead
      </button>
    </Modal>
  );
};

export default AccountSetupModal;
