import * as Dialog from "@radix-ui/react-dialog";

/**
 * Centered modal dialog shell used by the admin management screens (forms,
 * confirmations, one-time secrets). Same API as always — `{ title, onClose,
 * children }` — but now built on Radix Dialog: focus trap, Escape to close,
 * scroll lock, and proper dialog semantics come for free.
 *
 * `dismissible = false` makes it blocking (no ✕, Escape/outside clicks are
 * ignored) — for flows the user must complete, like first-run account setup.
 *
 * Styled with the flat design tokens (bordered surface, quiet overlay).
 */
const Modal = ({ title, onClose, children, size = "md", dismissible = true }) => (
  <Dialog.Root
    open
    onOpenChange={(open) => {
      if (!open && dismissible) onClose();
    }}
  >
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink/40" />
      <Dialog.Content
        onEscapeKeyDown={(event) => {
          if (!dismissible) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (!dismissible) event.preventDefault();
        }}
        className={`fixed left-1/2 top-1/2 z-[61] max-h-[calc(100vh-4rem)] w-[calc(100vw-2rem)] ${
          size === "lg" ? "max-w-4xl" : "max-w-[420px]"
        } -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-line bg-surface p-5 shadow-overlay`}
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
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

export default Modal;
