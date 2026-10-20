import * as AlertDialog from "@radix-ui/react-alert-dialog";
import Button from "./Button";
import TextField from "./Field";

/**
 * Confirmation dialog for destructive or hard-to-reverse actions.
 *
 * `requireText` (e.g. the record's email/name) turns it into a typed
 * confirmation — the confirm button stays disabled until the user types the
 * exact string.
 *
 * Same props as always; built on Radix AlertDialog (focus trap, Escape,
 * dialog semantics). The confirm button is intentionally NOT an
 * AlertDialog.Action — the parent keeps the dialog mounted while `busy`,
 * exactly like the old Modal-based version.
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
    <AlertDialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[60] bg-ink/40" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[61] w-[calc(100vw-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-surface p-5 shadow-overlay">
          <AlertDialog.Title asChild>
            <h2 className="text-[15px] font-bold text-ink">{title}</h2>
          </AlertDialog.Title>
          <AlertDialog.Description asChild>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">{message}</p>
          </AlertDialog.Description>

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
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default ConfirmDialog;
