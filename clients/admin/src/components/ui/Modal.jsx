import * as Dialog from "@radix-ui/react-dialog";

/**
 * Centered modal dialog shell used by the admin management screens (forms,
 * confirmations, one-time secrets). Same API as always — `{ title, onClose,
 * children }` — but now built on Radix Dialog: focus trap, Escape to close,
 * scroll lock, and proper dialog semantics come for free.
 *
 * Styled with the clay design tokens (raised surface, soft overlay).
 */
const Modal = ({ title, onClose, children }) => (
  <Dialog.Root
    open
    onOpenChange={(open) => {
      if (!open) onClose();
    }}
  >
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[60] bg-[#273556]/40" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] w-[calc(100vw-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-clay bg-surface p-5 shadow-clay-lg">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Dialog.Title asChild>
            <h2 className="text-[13px] font-bold text-ink">{title}</h2>
          </Dialog.Title>
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close"
              className="flex h-7 w-7 items-center justify-center rounded-clay-sm text-muted transition hover:bg-sunken hover:text-ink-soft"
            >
              ✕
            </button>
          </Dialog.Close>
        </div>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

export default Modal;
