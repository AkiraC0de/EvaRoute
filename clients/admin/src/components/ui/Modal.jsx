import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Centered modal dialog shell used by the admin management screens (forms,
 * confirmations, one-time secrets). Same API as always — `{ title, onClose,
 * children }` — but built on Radix Dialog: focus trap, Escape to close,
 * scroll lock, and proper dialog semantics come for free.
 *
 * `dismissible = false` makes it blocking (no ✕, Escape/outside clicks are
 * ignored) — for flows the user must complete, like first-run account setup.
 *
 * Motion: overlay fade + panel rise/scale (exit faster than enter). A close
 * request plays the exit and only then calls `onClose` — parents keep the
 * dialog mounted until then, so existing call sites need no changes.
 * Reduced motion = instant fade. The panel's centering lives in framer's
 * x/y percentages (Tailwind translate utilities would be overridden by the
 * animated transform).
 */
const Modal = ({ title, onClose, children, size = "md", dismissible = true }) => {
  const [open, setOpen] = useState(true);
  const reduceMotion = useReducedMotion();
  const requestClose = () => setOpen(false);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next && dismissible) requestClose();
      }}
    >
      <Dialog.Portal forceMount>
        <AnimatePresence onExitComplete={onClose}>
          {open && (
            <Dialog.Overlay key="overlay" forceMount asChild>
              <motion.div
                className="fixed inset-0 z-[60] bg-ink/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.18 }}
              />
            </Dialog.Overlay>
          )}
          {open && (
            <Dialog.Content
              key="content"
              forceMount
              asChild
              onEscapeKeyDown={(event) => {
                if (!dismissible) event.preventDefault();
              }}
              onInteractOutside={(event) => {
                if (!dismissible) event.preventDefault();
              }}
            >
              <motion.div
                className={`fixed left-1/2 top-1/2 z-[61] max-h-[calc(100vh-4rem)] w-[calc(100vw-2rem)] ${
                  size === "lg" ? "max-w-4xl" : "max-w-[420px]"
                } overflow-y-auto rounded-xl border border-line bg-surface p-5 shadow-overlay`}
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
                <div className="mb-3 flex items-center justify-between gap-2">
                  <Dialog.Title asChild>
                    <h2 className="text-[15px] font-bold text-ink">{title}</h2>
                  </Dialog.Title>
                  {dismissible && (
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        aria-label="Close"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-surface-2 hover:text-ink-soft"
                      >
                        ✕
                      </button>
                    </Dialog.Close>
                  )}
                </div>
                {children}
              </motion.div>
            </Dialog.Content>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
