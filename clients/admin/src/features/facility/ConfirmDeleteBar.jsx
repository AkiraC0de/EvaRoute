/**
 * Inline confirmation strip shown in place of the resource controls before a
 * delete — a stray click can never remove a record. This strip is the card's
 * singular terminal (danger) action.
 */
const ConfirmDeleteBar = ({ busy, onConfirm, onCancel }) => (
  <div className="flex w-full items-center gap-2 rounded-full bg-danger-soft p-1">
    <span className="pl-2 text-[11px] font-semibold text-danger">Remove?</span>
    <button
      type="button"
      disabled={busy}
      onClick={onConfirm}
      className="ml-auto min-h-11 rounded-full bg-danger px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-danger-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:opacity-60 sm:min-h-8"
    >
      {busy ? "Removing…" : "Remove"}
    </button>
    <button
      type="button"
      disabled={busy}
      onClick={onCancel}
      className="min-h-11 rounded-full bg-surface px-3 py-1.5 text-[11px] font-semibold text-muted transition hover:bg-surface-2 hover:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink disabled:opacity-60 sm:min-h-8"
    >
      Cancel
    </button>
  </div>
);

export default ConfirmDeleteBar;
