import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import TextField from "../../../components/ui/Field";

/**
 * Create-staff dialog — email only; the server generates and emails the
 * password (which is then shown once via the generated-password modal).
 */
const CreateStaffDialog = ({ email, onEmailChange, onSubmit, onClose, busy }) => (
  <Modal title="Create staff account" onClose={onClose}>
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="space-y-3"
    >
      <TextField
        label="Work email"
        type="email"
        required
        value={email}
        onChange={onEmailChange}
        placeholder="you@example.com"
      />
      <p className="text-[11px] leading-relaxed text-muted-dim">
        The server generates a default password and emails it to the staff member. You
        will also see it once so you can share it securely.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="neutral" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "Creating…" : "Create account"}
        </Button>
      </div>
    </form>
  </Modal>
);

export default CreateStaffDialog;
