import ConfirmDialog from "../../../components/ui/ConfirmDialog";

/**
 * Confirmation for the activate/deactivate/delete/reset lifecycle actions.
 * Copy, tone and the type-to-confirm requirement (delete only) follow the
 * action kind; `action.typed` holds the require-text draft.
 */
const StaffConfirmDialog = ({ action, onTypedChange, busy, onConfirm, onCancel }) => (
  <ConfirmDialog
    title={
      action.type === "delete"
        ? "Delete staff account"
        : action.type === "deactivate"
          ? "Deactivate staff account"
          : action.type === "activate"
            ? "Activate staff account"
            : "Reset password"
    }
    message={
      action.type === "delete"
        ? `Permanently delete ${action.staff.email}? This cannot be undone.`
        : action.type === "deactivate"
          ? `Deactivate ${action.staff.email}? They will be signed out from all devices and cannot log in until reactivated.`
          : action.type === "activate"
            ? `Reactivate ${action.staff.email}?`
            : `Reset the password for ${action.staff.email}? A new default password will be generated and emailed to them; they will be signed out from all devices.`
    }
    confirmLabel={
      action.type === "delete"
        ? "Delete"
        : action.type === "deactivate"
          ? "Deactivate"
          : action.type === "activate"
            ? "Activate"
            : "Reset password"
    }
    tone={action.type === "delete" || action.type === "deactivate" ? "danger" : "primary"}
    requireText={action.type === "delete" ? action.staff.email : undefined}
    typed={action.typed ?? ""}
    onTypedChange={onTypedChange}
    busy={busy}
    onConfirm={onConfirm}
    onCancel={onCancel}
  />
);

export default StaffConfirmDialog;
