import Button from "../../components/ui/Button";
import TextField from "../../components/ui/Field";

/**
 * Inline password confirmation used before the sign-out-all-devices action.
 * The API requires the account password as proof of identity. The panel is a
 * flat inset band (bg-surface-2 + hairline border); the field sits on a
 * surface slot inside it.
 */
const PasswordConfirmForm = ({ password, onPasswordChange, onSubmit, onCancel, busy }) => (
  <form
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}
    className="rounded-md border border-line bg-surface-2 p-3"
  >
    <TextField
      label="Confirm your password"
      type="password"
      autoComplete="current-password"
      value={password}
      onChange={(event) => onPasswordChange(event.target.value)}
      fieldClassName="bg-surface"
    />
    <p className="mt-2 text-[10px] text-muted">
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
