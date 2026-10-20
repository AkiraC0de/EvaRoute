import { Link } from "react-router-dom";
import { RotateCcw, Trash2 } from "lucide-react";
import StatusPill from "../../../components/ui/StatusPill";
import { TableShell, Th, Td, Tr } from "../../../components/ui/Table";
import { displayPlaceName } from "../../../lib/utils";

/**
 * Facilities table — one row per facility with name link, status, capacity,
 * staff count and the row actions. `onToggle(facility)` opens the page's
 * delete/restore confirmation for that row.
 */
const FacilitiesTable = ({ facilities, showDeleted, onToggle }) => (
  <TableShell>
    <thead>
      <tr className="bg-sunken">
        {[
          { label: "Name" },
          { label: "Address" },
          { label: "Status" },
          { label: "Capacity", align: "right" },
          { label: "Staff", align: "right" },
          { label: "Actions" },
        ].map(({ label, align }) => (
          <Th key={label} className={align === "right" ? "text-right" : ""}>
            {label}
          </Th>
        ))}
      </tr>
    </thead>
    <tbody>
      {facilities.map((facility) => (
        <Tr key={facility.id}>
          <Td>
            <Link
              to={`/facilities/${facility.id}`}
              title={facility.name}
              className="text-[12px] font-semibold text-accent transition hover:text-accent-strong"
            >
              {displayPlaceName(facility.name)}
            </Link>
          </Td>
          <Td>
            <span
              className="block max-w-[220px] truncate text-[11px] text-muted"
              title={facility.address}
            >
              {displayPlaceName(facility.address)}
            </span>
          </Td>
          <Td>
            <StatusPill status={facility.status} />
          </Td>
          <Td className="text-right">
            <span className="text-[11px] text-muted">{facility.maxCapacity}</span>
          </Td>
          <Td className="text-right">
            <span className="text-[11px] text-muted">{facility.staffCount ?? 0}</span>
          </Td>
          <Td>
            <div className="flex items-center gap-2">
              <Link
                to={`/facilities/${facility.id}`}
                className="text-[11px] font-semibold text-accent transition hover:text-accent-strong"
              >
                Manage
              </Link>
              <button
                type="button"
                onClick={() => onToggle(facility)}
                className={`inline-flex items-center gap-1 text-[11px] font-semibold transition ${
                  showDeleted
                    ? "text-success hover:text-[#155c2c]"
                    : "text-danger hover:text-danger-strong"
                }`}
              >
                {showDeleted ? (
                  <><RotateCcw size={11} strokeWidth={2} /> Restore</>
                ) : (
                  <><Trash2 size={11} strokeWidth={2} /> Delete</>
                )}
              </button>
            </div>
          </Td>
        </Tr>
      ))}
    </tbody>
  </TableShell>
);

export default FacilitiesTable;
