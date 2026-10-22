import * as Dialog from "@radix-ui/react-dialog";
import { motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";

/**
 * Right-side drawer — the registry's ONE surface for create/edit flows.
 * Same accessibility contract as Modal (Radix dialog: focus trap, Escape,
 * aria-modal) with a slide-in panel grammar and the app's flat chrome.
 */
const Drawer = ({ title, description, onClose, children }) => {
  const reduceMotion = useReducedMotion();

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            className="fixed inset-0 z-[70] bg-ink/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === "string" ? title : undefined}
            className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-[480px] flex-col border-l border-line bg-surface shadow-xl"
            initial={reduceMotion ? false : { x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0, transition: { duration: reduceMotion ? 0 : 0.14 } }}
            transition={{ duration: reduceMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <Dialog.Title asChild>
                  <h2 className="text-[15px] font-bold text-ink">{title}</h2>
                </Dialog.Title>
                {description && (
                  <Dialog.Description className="mt-1 text-[11px] text-muted">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition hover:bg-surface-2 hover:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
                >
                  <X size={15} strokeWidth={2} />
                </button>
              </Dialog.Close>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Drawer;
