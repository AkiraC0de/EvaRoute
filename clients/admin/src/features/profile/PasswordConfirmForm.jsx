import Button from "../../components/ui/Button";

/**
 * Inline password confirmation used before the sign-out-all-devices action.
 * The API requires the account password as proof of identity. Field styling
 * matches the original inline form (white input inside the inset panel).
 */
const PasswordConfirmForm = ({ password, onPasswordChange, onSubmit, onCancel, busy }) => (
  <form
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}
    className="rounded-2xl bg-[#f6f8fc] px-3 py-3 shadow-[inset_0_2px_5px_rgba(40,55,90,0.12)]"
  >
    <label className="block">
      <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
        Confirm your password
      </span>
      <input
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
        className="h-9 w-full rounded-xl bg-white px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] focus:ring-2"
      />
    </label>
    <p className="mt-2 text-[8px] text-[#8995ad]">
      The API requires your password as proof of identity for this action.
    </p>
    <div className="mt-3 flex gap-2">
      <Button
        type="submit"
        disabled={busy || !password}
        className="px-3 py-1.5 text-[9px]"
      >
        {busy ? "Signing out…" : "Confirm"}
      </Button>
      <Button
        variant="neutral"
        onClick={onCancel}
        className="px-3 py-1.5 text-[9px]"
      >
        Cancel
      </Button>
    </div>
  </form>
);

export default PasswordConfirmForm;
