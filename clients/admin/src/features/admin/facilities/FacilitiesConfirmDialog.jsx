import ConfirmDialog from "../../../components/ui/ConfirmDialog";

/**
 * Delete/restore confirmation for the facilities registry. COPY and tone
 * follow the `deleted` tab: DELETE is a toggle server-side, so the deleted
 * tab confirms RESTORE instead.
 */
const FacilitiesConfirmDialog = ({ showDeleted, target, busy, onConfirm, onCancel }) => (
  <ConfirmDialog
    title={showDeleted ? "Restore facility" : "Delete facility"}
    message={
      showDeleted
        ? `Restore “${target.name}”? It will become visible and available for operations again.`
        : `Delete “${target.name}”? It will be hidden from operations. You can restore it later from the deleted list. Checked-in evacuees block deletion.`
    }
    confirmLabel={showDeleted ? "Restore" : "Delete"}
    tone={showDeleted ? "primary" : "danger"}
    busy={busy}
    onConfirm={onConfirm}
    onCancel={onCancel}
  />
);

export default FacilitiesConfirmDialog;
