import Button from "../../components/ui/Button";
import TextField from "../../components/ui/Field";

/**
 * Inline password confirmation used before the sign-out-all-devices action.
 * The API requires the account password as proof of identity. The panel is a
 * recessed clay inset; the field sits on a raised white slot inside it.
 */
const PasswordConfirmForm = ({ password, onPasswordChange, onSubmit, onCancel, busy }) => (
  <form
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}
    className="rounded-2xl bg-sunken p-3 shadow-clay-inset"
  >
    <TextField
      label="Confirm your password"
      type="password"
      autoComplete="current-password"
      value={password}
      onChange={(event) => onPasswordChange(event.target.value)}
      fieldClassName="bg-surface"
    />
    <p className="mt-2 text-[8px] text-muted">
      The API requires your password as proof of identity for this action.
    </p>
    <div className="mt-3 flex gap-2">
      <Button type="submit" size="sm" disabled={busy || !password}>
        {busy ? "Signing out…" : "Confirm"}
      </Button>
      <Button variant="neutral" size="sm" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  </form>
);

export default PasswordConfirmForm;
