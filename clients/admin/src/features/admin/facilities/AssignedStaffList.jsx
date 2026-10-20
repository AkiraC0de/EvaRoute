import { X } from "lucide-react";
import Button from "../../../components/ui/Button";
import StatusPanel from "../../../components/ui/StatusPanel";
import { FacilityStaffLoading } from "./FacilitiesStates";

/**
 * Left pane of the staff assignment panel — the assigned roster with its
 * loading/error states and the per-row Dismiss action (`onDismiss(member)`
 * opens the section's confirmation).
 */
const AssignedStaffList = ({ staff, loading, error, onRetry, onDismiss }) => (
  <div>
    <div className="mb-2 flex items-center justify-between gap-2">
      <h3 className="text-[12px] font-bold text-ink-soft">Assigned staff</h3>
      <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted">
        {staff.length}
      </span>
    </div>

    {loading && <FacilityStaffLoading />}

    {!loading && error && (
      <StatusPanel tone="error" title="Could not load staff" onRetry={onRetry}>
        {error.message}
      </StatusPanel>
    )}

    {!loading && !error && (
      <ul className="max-h-90 space-y-2 overflow-y-auto pr-1">
        {staff.map((member) => (
          <li
            key={member.userId}
            className="flex items-center gap-3 rounded-md bg-surface-2 px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-ink-soft">
                {member.firstName && member.lastName
                  ? `${member.firstName} ${member.lastName}`
                  : member.email}
              </p>
              <p className="text-[10px] text-muted">{member.email}</p>
            </div>
            <Button
              variant="neutral"
              size="sm"
              onClick={() => onDismiss(member)}
            >
              <X size={11} strokeWidth={2} className="mr-1" /> Dismiss
            </Button>
          </li>
        ))}
        {staff.length === 0 && (
          <li className="rounded-md bg-surface-2 py-4 text-center text-[11px] text-muted">
            No staff assigned to this facility yet.
          </li>
        )}
      </ul>
    )}
  </div>
);

export default AssignedStaffList;
