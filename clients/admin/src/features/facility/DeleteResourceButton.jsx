import { Trash2 } from "lucide-react";

/**
 * Trash icon button for removing a resource. Purely the trigger — the
 * confirmation strip is ConfirmDeleteBar (it replaces the card's controls),
 * so the parent hides this button while confirming, exactly like the original
 * card. 44px touch target on small screens; icon + tooltip for the label.
 */
const DeleteResourceButton = ({ name, busy, onAsk }) => (
  <button
    type="button"
    aria-label={`Remove ${name}`}
    title={`Remove ${name}`}
    disabled={busy}
    onClick={onAsk}
    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-dim transition hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:opacity-50 sm:h-7 sm:w-7"
  >
    <Trash2 size={14} strokeWidth={1.8} />
  </button>
);

export default DeleteResourceButton;
