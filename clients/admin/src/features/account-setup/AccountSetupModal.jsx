import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import TextField from "../../components/ui/Field";
import Banner from "../../components/ui/Banner";

/**
 * First-run account setup dialog — blocking (not dismissible): staff
 * accounts are created with only email + password, so the user must supply
 * their name before the portal unlocks. "Sign out" is the only escape.
 */
const AccountSetupModal = ({ draft, onDraftChange, onSubmit, onSignOut, busy, error }) => {
  const ready = draft.firstName.trim().length > 0 && draft.lastName.trim().length > 0;

  return (
    <Modal title="Set up your account" dismissible={false} onClose={onSignOut}>
      <p className="mb-3 text-[12px] leading-relaxed text-muted">
        Your account was created with just an email and password. Add your
        details to continue to the portal.
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
