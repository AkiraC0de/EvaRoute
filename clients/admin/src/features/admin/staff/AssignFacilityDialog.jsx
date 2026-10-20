import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { SelectField } from "../../../components/ui/Field";

/**
 * Assign / reassign a staff account to a facility (ADMIN). The server
 * TRANSFERS the staff when they already belong to another facility
 * (`POST /facility/:facilityId/staff/:userId`), so the copy names the
 * current assignment and the confirm button names the target. The current
 * facility is offered but disabled — moving is done by picking another one.
 */
const AssignFacilityDialog = ({
  staff,
  facilities,
  value,
  onChange,
  onSubmit,
  onClose,
  busy,
}) => {
  const current = staff.facility ?? null;
  const target = facilities.find((facility) => facility.id === value) ?? null;
  const isTransfer = Boolean(current);

  return (
    <Modal title={isTransfer ? "Reassign facility" : "Assign to facility"} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (target) onSubmit();
        }}
        className="space-y-3"
      >
        <div className="rounded-md border border-line bg-surface-2 px-3 py-2">
          <p className="text-[12px] font-bold text-ink-soft">
            {staff.firstName || staff.lastName
              ? `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim()
              : staff.email}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">
            {current ? `Currently assigned to ${current.name}` : "Not assigned to any facility"}
          </p>
        </div>

        <SelectField
          label="Facility"
          value={value}
          onChange={onChange}
        >
          <option value="" disabled>
            Choose a facility…
          </option>
          {facilities.map((facility) => (
            <option
              key={facility.id}
              value={facility.id}
              disabled={current ? facility.id === current.id : false}
            >
              {facility.name}
              {current && facility.id === current.id ? " (current)" : ""}
            </option>
          ))}
        </SelectField>

        <p className="text-[11px] leading-relaxed text-muted">
          {isTransfer
            ? `Confirming transfers this staff member from ${current.name} to ${target ? target.name : "the selected facility"}. They lose access to ${current.name}.`
            : "Confirming assigns this staff member to the selected facility."}
        </p>

        <div className="flex justify-end gap-2">
          <Button variant="neutral" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={busy || !target}>
            {busy
              ? "Saving…"
              : isTransfer
                ? `Transfer to ${target ? target.name : "facility"}`
                : `Assign to ${target ? target.name : "facility"}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignFacilityDialog;
