import Button from "./Button";
import Modal from "./Modal";
import TextField from "./Field";

/**
 * Confirmation dialog for destructive or hard-to-reverse actions.
 *
 * `requireText` (e.g. the record's email/name) turns it into a typed
 * confirmation — the confirm button stays disabled until the user types the
 * exact string.
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
        <div className="mt-3">
          <TextField
            label={`Type “${requireText}” to confirm`}
            value={typed}
            onChange={(event) => onTypedChange(event.target.value)}
          />
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="neutral" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant={tone}
          size="sm"
          onClick={onConfirm}
          disabled={busy || blockedByTyping}
        >
          {busy ? "Working…" : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
