/**
 * Inline confirmation strip shown in place of the resource controls before a
 * delete — a stray click can never remove a record.
 */
const ConfirmDeleteBar = ({ busy, onConfirm, onCancel }) => (
  <div className="flex w-full items-center gap-2 rounded-full bg-[#fbe4e3] p-1">
    <span className="pl-2 text-[9px] font-semibold text-[#d8322d]">Remove?</span>
    <button
      type="button"
      disabled={busy}
      onClick={onConfirm}
      className="ml-auto rounded-full bg-[#d8322d] px-3 py-1.5 text-[9px] font-semibold text-white transition hover:bg-[#b3261f] disabled:opacity-60"
    >
      {busy ? "Removing…" : "Remove"}
    </button>
    <button
      type="button"
      disabled={busy}
      onClick={onCancel}
      className="rounded-full bg-white px-3 py-1.5 text-[9px] font-semibold text-[#65718c] transition hover:bg-[#f0f2f7] disabled:opacity-60"
    >
      Cancel
    </button>
  </div>
);

export default ConfirmDeleteBar;
