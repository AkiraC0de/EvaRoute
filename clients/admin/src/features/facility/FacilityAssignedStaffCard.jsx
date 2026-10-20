import { Users } from "lucide-react";
import Card from "../../components/ui/Card";

/**
 * Assigned staff roster for this facility (GET /facility/:facilityId/staff —
 * FETCH_STAFF). Chips with initials + name; the signed-in user sees who else
 * works this facility. Read-only — assignment is managed by administrators.
 */
const FacilityAssignedStaffCard = ({ staffs, loading }) => {
  const rows = staffs ?? [];

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary-soft text-secondary-ink"
        >
          <Users size={15} strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[13px] font-bold text-ink-soft">Assigned staff</h2>
          <p className="text-[10px] text-muted">Who works this facility</p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-semibold text-muted">
          {rows.length}
        </span>
      </div>

      {loading && <p className="text-[11px] text-muted">Loading staff…</p>}

      {!loading && rows.length === 0 && (
        <p className="text-[11px] text-muted">No staff are assigned to this facility yet.</p>
      )}

      {!loading && rows.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {rows.map((staff) => {
            const name =
              staff.firstName || staff.lastName
                ? `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim()
                : staff.email;
            const initials =
              `${staff.firstName ?? ""} ${staff.lastName ?? ""}`
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((word) => word[0])
                .join("")
                .toUpperCase() || (staff.email ?? "?")[0].toUpperCase();
            return (
              <li
                key={staff.id}
                className="flex items-center gap-2 rounded-full bg-surface-2 py-1 pl-1 pr-2.5"
              >
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-soft text-[9px] font-bold text-secondary-ink"
                >
                  {initials}
                </span>
                <span className="max-w-[160px] truncate text-[11px] font-semibold text-ink-soft" title={name}>
                  {name}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default FacilityAssignedStaffCard;
