import Button from "./Button";
import Modal from "./Modal";

/**
 * Confirmation dialog for destructive or hard-to-reverse actions.
 *
 * `requireText` (e.g. the record's email/name) turns it into a typed
 * confirmation — the confirm button stays disabled until the user types the
 * exact string. `tone="danger"` paints the confirm button red.
 */
const ConfirmDialog = ({
  title,
  message,
  confirmLabel = "Confirm",
  tone = "danger",
  requireText,
  typed,
  onTypedChange,
  busy,
  onConfirm,
  onCancel,
}) => {
  const blockedByTyping = Boolean(requireText) && typed !== requireText;

  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-[10px] leading-relaxed text-[#65718c]">{message}</p>

      {requireText && (
        <label className="mt-3 block">
          <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
            Type “{requireText}” to confirm
          </span>
          <input
            value={typed}
            onChange={(event) => onTypedChange(event.target.value)}
            className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] focus:ring-2"
          />
        </label>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="neutral" onClick={onCancel} className="px-3 py-1.5 text-[9px]">
          Cancel
        </Button>
        <Button
          variant={tone}
          onClick={onConfirm}
          disabled={busy || blockedByTyping}
          className="px-3 py-1.5 text-[9px]"
        >
          {busy ? "Working…" : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
