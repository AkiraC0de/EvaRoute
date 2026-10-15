import { Trash2 } from "lucide-react";

/**
 * Trash icon button for removing a resource. Purely the trigger — the
 * confirmation strip is ConfirmDeleteBar (it replaces the card's controls),
 * so the parent hides this button while confirming, exactly like the original
 * card.
 */
const DeleteResourceButton = ({ name, busy, onAsk }) => (
  <button
    type="button"
    aria-label={`Remove ${name}`}
    disabled={busy}
    onClick={onAsk}
    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#9aa4b8] transition hover:bg-[#fbe4e3] hover:text-[#d8322d] disabled:opacity-50"
  >
    <Trash2 size={14} strokeWidth={1.8} />
  </button>
);

export default DeleteResourceButton;
