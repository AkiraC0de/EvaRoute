import Banner from "../../components/ui/Banner";
import Button from "../../components/ui/Button";
import CopyId from "../../components/ui/CopyId";
import Modal from "../../components/ui/Modal";
import { checkInCode, formatCheckedInAt } from "./occupancyUtils";

/**
 * Bulk check-out confirmation — the pop-out that names exactly which
 * households a multi-select check-out will mark as checked-out BEFORE the
 * terminal action runs. Names first, destructive action last: staff can
 * verify the selection instead of trusting a count.
 *
 * Props (contract with the check-ins list):
 *   stays     — the selected stay records: { id, familyName, members?, checkedInAt? }
 *   busy      — the bulk mutation is in flight: both actions disabled, the
 *               confirm button reads "Checking out…", and the dialog stops
 *               being dismissible (no ✕ / Escape / outside click mid-flight)
 *   error     — "" or the message to show INSIDE the dialog (modals hide the
 *               page banners, so failures must live here)
 *   onConfirm — () => void|Promise; the caller runs the bulk mutation and
 *               owns selection cleanup, so this dialog stays presentational
 *   onCancel  — () => void; wired to the Modal's onClose, which fires only
 *               after the exit animation (shared Modal convention)
 *
 * Built on the shared Modal, not ConfirmDialog: the body is a structured
 * family list with copyable Check-In IDs, not a one-line string message.
 */
const CheckOutConfirmDialog = ({ stays, busy, error, onConfirm, onCancel }) => {
  const selected = Array.isArray(stays) ? stays : [];
  const count = selected.length;

  return (
    <Modal
      title={`Check out ${count} household${count === 1 ? "" : "s"}?`}
      onClose={onCancel}
      dismissible={!busy}
    >
      {/* The roll of who is affected — scrollable so long selections keep the
          actions in view. Each row carries the Check-In ID as a copy chip so
          staff can cross-check against a paper list or the meal count. */}
      <ul className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-line bg-surface-2 p-1.5">
        {selected.map((stay) => {
          const meta = [];
          if (Array.isArray(stay.members)) {
            meta.push(`${stay.members.length} ${stay.members.length === 1 ? "person" : "people"}`);
          }
          if (stay.checkedInAt) meta.push(`Checked in ${formatCheckedInAt(stay.checkedInAt)}`);
          return (
            <li
              key={stay.id}
              className="flex items-center justify-between gap-2 rounded-md bg-surface px-2.5 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink">{stay.familyName}</p>
                {meta.length > 0 && <p className="mt-0.5 text-[11px] text-muted">{meta.join(" · ")}</p>}
              </div>
              <CopyId
                value={checkInCode(stay)}
                label="Check-In ID"
                className="shrink-0 text-[11px] text-muted-dim"
              />
            </li>
          );
        })}
      </ul>

      {/* What the action actually does, before the destructive button —
          immediate, and not undoable from this screen. */}
      <p className="mt-3 text-[12px] leading-relaxed text-muted">
        This immediately marks {count === 1 ? "this household" : "these households"} as checked-out.
        It cannot be undone from here — {count === 1 ? "it moves" : "they move"} to the checked-out
        list.
      </p>

      {error ? (
        <Banner tone="error" className="mt-3 px-3 py-2 text-[12px]">
          {error}
        </Banner>
      ) : null}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="neutral" size="sm" className="min-h-8" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
        {/* Danger is reserved for this terminal action — the only destructive
            control in the dialog. */}
        <Button variant="danger" size="sm" className="min-h-8" disabled={busy} onClick={onConfirm}>
          {busy ? "Checking out…" : "Mark as checked out"}
        </Button>
      </div>
    </Modal>
  );
};

export default CheckOutConfirmDialog;
