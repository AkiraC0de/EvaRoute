/**
 * Inline confirmation strip shown in place of the resource controls before a
 * delete — a stray click can never remove a record.
 */
const ConfirmDeleteBar = ({ busy, onConfirm, onCancel }) => (
  <div className="flex w-full items-center gap-2 rounded-full bg-danger-soft p-1 shadow-clay-inset">
    <span className="pl-2 text-[9px] font-semibold text-danger">Remove?</span>
    <button
      type="button"
      disabled={busy}
      onClick={onConfirm}
      className="ml-auto rounded-full bg-danger px-3 py-1.5 text-[9px] font-semibold text-white shadow-clay-xs transition hover:bg-danger-strong disabled:opacity-60"
    >
      {busy ? "Removing…" : "Remove"}
    </button>
    <button
      type="button"
      disabled={busy}
      onClick={onCancel}
      className="rounded-full bg-surface px-3 py-1.5 text-[9px] font-semibold text-[#65718c] shadow-clay-xs transition hover:bg-sunken disabled:opacity-60"
    >
      Cancel
    </button>
  </div>
);

export default ConfirmDeleteBar;
