import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import TextField from "../../../components/ui/Field";

/** Edit-name dialog — first/last name for one staff account. */
const EditStaffNameDialog = ({ draft, onDraftChange, onSubmit, onClose, busy }) => (
  <Modal title="Edit staff name" onClose={onClose}>
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="space-y-3"
    >
      <TextField
        label="First name"
        value={draft.firstName}
        onChange={(event) => onDraftChange({ ...draft, firstName: event.target.value })}
      />
      <TextField
        label="Last name"
        value={draft.lastName}
        onChange={(event) => onDraftChange({ ...draft, lastName: event.target.value })}
      />
      <div className="flex justify-end gap-2">
        <Button variant="neutral" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  </Modal>
);

export default EditStaffNameDialog;
