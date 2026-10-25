import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
 * exactly like the old Modal-based version. Motion matches Modal (overlay
 * fade + panel rise/scale, exit faster than enter): a cancel request plays
 * the exit and only then calls `onCancel`. Reduced motion = instant fade.
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
  const [open, setOpen] = useState(true);
  const reduceMotion = useReducedMotion();
  // Not dismissible mid-mutation (same convention as Modal's `dismissible`
  // and CheckOutConfirmDialog): Escape/overlay/Cancel must not close a
  // destructive confirm while its request is in flight — re-opening would
  // allow a second confirm against already-changed data.
  const requestCancel = () => {
    if (busy) return;
    setOpen(false);
  };
  const blockedByTyping = Boolean(requireText) && typed !== requireText;

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) requestCancel();
      }}
    >
      <AlertDialog.Portal forceMount>
        <AnimatePresence onExitComplete={onCancel}>
          {open && (
            <AlertDialog.Overlay key="overlay" forceMount asChild>
              <motion.div
                className="fixed inset-0 z-[60] bg-ink/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.18 }}
              />
            </AlertDialog.Overlay>
          )}
          {open && (
            <AlertDialog.Content key="content" forceMount asChild
              onEscapeKeyDown={(event) => {
                if (busy) event.preventDefault();
              }}
              onInteractOutside={(event) => {
                if (busy) event.preventDefault();
              }}
            >
              <motion.div
                className="fixed left-1/2 top-1/2 z-[61] w-[calc(100vw-2rem)] max-w-[420px] rounded-xl border border-line bg-surface p-5 shadow-overlay"
                initial={
                  reduceMotion
                    ? { opacity: 0, x: "-50%", y: "-50%" }
                    : { opacity: 0, x: "-50%", y: "-46%", scale: 0.98 }
                }
                animate={{ opacity: 1, x: "-50%", y: "-50%", scale: 1 }}
                exit={
                  reduceMotion
                    ? { opacity: 0, x: "-50%", y: "-50%" }
                    : {
                        opacity: 0,
                        x: "-50%",
                        y: "-47%",
                        scale: 0.98,
                        transition: { duration: 0.14, ease: "easeIn" },
                      }
                }
                transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
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
                  <Button variant="neutral" size="sm" onClick={requestCancel} disabled={busy}>
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
              </motion.div>
            </AlertDialog.Content>
          )}
        </AnimatePresence>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default ConfirmDialog;
