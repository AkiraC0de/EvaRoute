/**
 * Centered modal dialog shell used by the admin management screens (forms,
 * confirmations, one-time secrets). Closes on the overlay or the X; content
 * is whatever children the caller passes.
 */
const Modal = ({ title, onClose, children }) => (
  <div
    className="fixed inset-0 z-[60] flex items-center justify-center bg-[#273556]/40 p-4"
    onClick={onClose}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="w-full max-w-[420px] rounded-[20px] bg-white p-5 shadow-[0_12px_36px_rgba(40,60,100,0.22)]"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[13px] font-bold text-[#273556]">{title}</h2>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8290aa] transition hover:bg-[#f0f2f7] hover:text-[#35405e]"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default Modal;
