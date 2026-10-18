import { Td, Tr } from "../../../components/ui/Table";
import StatusPill from "../../../components/ui/StatusPill";

/**
 * One staff row — name/email/facility/status cells plus the row actions.
 * `onAction(type, staff)` covers activate/deactivate/reset/delete (the page
 * clears the action banner and opens the confirm dialog); `onEdit(staff)`
 * opens the name editor. Self rows hide deactivate/delete.
 */
const StaffTableRow = ({ staff, isSelf, onEdit, onAction }) => (
  <Tr>
    <Td>
      <span className="text-[12px] font-semibold text-ink-soft">
        {staff.firstName || staff.lastName
          ? `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim()
          : "—"}
      </span>
      {isSelf && <span className="ml-2 text-[10px] text-muted-dim">(you)</span>}
    </Td>
    <Td>
      <span className="text-[11px] text-muted">{staff.email}</span>
    </Td>
    <Td>
      <span className="text-[11px] text-muted">
        {staff.facility ? staff.facility.name : "Unassigned"}
      </span>
    </Td>
    <Td>
      <StatusPill tone={staff.isActive ? "success" : "danger"}>
        {staff.isActive ? "Active" : "Inactive"}
      </StatusPill>
    </Td>
    <Td>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={() => onEdit(staff)}
          className="text-[11px] font-semibold text-accent transition hover:text-accent-strong"
        >
          Edit
        </button>
        {staff.isActive ? (
          !isSelf && (
            <button
              type="button"
              onClick={() => onAction("deactivate", staff)}
              className="text-[11px] font-semibold text-warning transition hover:text-[#8a5400]"
            >
              Deactivate
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={() => onAction("activate", staff)}
            className="text-[11px] font-semibold text-success transition hover:text-[#155c2c]"
          >
            Activate
          </button>
        )}
        <button
          type="button"
          onClick={() => onAction("reset", staff)}
          className="text-[11px] font-semibold text-accent transition hover:text-accent-strong"
        >
          Reset password
        </button>
        {!isSelf && (
          <button
            type="button"
            onClick={() => onAction("delete", staff)}
            className="text-[11px] font-semibold text-danger transition hover:text-danger-strong"
          >
            Delete
          </button>
        )}
      </div>
    </Td>
  </Tr>
);

export default StaffTableRow;
