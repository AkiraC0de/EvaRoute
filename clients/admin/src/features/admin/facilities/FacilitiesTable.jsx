import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, RotateCcw, Trash2 } from "../../../components/icons/evaIcons";
import StatusPill from "../../../components/ui/StatusPill";
import { TableShell, Th, Td, Tr } from "../../../components/ui/Table";
import PaginationBar from "../../activity/PaginationBar";
import { displayPlaceName } from "../../../lib/utils";

/**
 * Facilities table — the registry grid: sortable columns, bulk selection,
 * per-row occupancy (occupied/max with a load meter and families count) and
 * the pagination bar. Rows participate in the list⇄map link: hover rings the
 * marker, clicking the row selects it (the name link and actions still
 * navigate/act — only the row surface selects).
 */
const SORTABLE = {
  Name: "name",
  Capacity: "capacity",
  Staff: "staff",
};

/** Sortable column header (module scope — components are never created in render). */
const SortTh = ({ label, align, sort, order, onSort }) => {
  const field = SORTABLE[label];
  const active = field && sort === field;
  return (
    <Th className={align === "right" ? "text-right" : ""}>
      {field ? (
        <button
          type="button"
          onClick={() => onSort(field)}
          aria-sort={active ? (order === "asc" ? "ascending" : "descending") : "none"}
          className={`inline-flex items-center gap-1 transition ${align === "right" ? "flex-row-reverse" : ""} ${active ? "text-primary-ink" : "hover:text-ink-soft"}`}
        >
          {label}
          {active ? (
            order === "asc" ? (
              <ChevronUp size={11} strokeWidth={2} />
            ) : (
              <ChevronDown size={11} strokeWidth={2} />
            )
          ) : (
            <ChevronDown size={11} strokeWidth={2} className="opacity-30" />
          )}
        </button>
      ) : (
        label
      )}
    </Th>
  );
};

const FacilitiesTable = ({
  facilities,
  showDeleted,
  onToggle,
  hoverId = null,
  selectedId = null,
  onHover = () => {},
  onSelect = () => {},
  sort = "created",
  order = "asc",
  onSort = () => {},
  selectedIds = new Set(),
  onToggleSelect = () => {},
  onToggleAll = () => {},
  page = 1,
  totalPages = 1,
  total = 0,
  pageSize = 10,
  onPage = () => {},
}) => {
  const allSelected =
    facilities.length > 0 && facilities.every((f) => selectedIds.has(f.id));

  return (
    <TableShell>
      <thead>
        <tr className="bg-surface-2">
          <Th className="w-9">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onToggleAll}
              aria-label="Select all rows on this page"
              className="h-3.5 w-3.5 accent-[var(--color-primary)]"
            />
          </Th>
          <SortTh label="Name" sort={sort} order={order} onSort={onSort} />
          <Th>Address</Th>
          <Th>Status</Th>
          <SortTh label="Capacity" align="right" sort={sort} order={order} onSort={onSort} />
          <SortTh label="Staff" align="right" sort={sort} order={order} onSort={onSort} />
          <Th>Actions</Th>
        </tr>
      </thead>
      <tbody>
        {facilities.map((facility) => {
          const pct =
            facility.maxCapacity > 0
              ? Math.min(100, Math.round(((facility.occupied ?? 0) / facility.maxCapacity) * 100))
              : 0;
          return (
            <Tr
              key={facility.id}
              onMouseEnter={() => onHover(facility.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(facility.id)}
              className={`cursor-pointer transition-colors ${
                selectedId === facility.id
                  ? "bg-primary-soft/60"
                  : hoverId === facility.id
                    ? "bg-surface-2"
                    : ""
              }`}
            >
              <Td onClick={(event) => event.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(facility.id)}
                  onChange={() => onToggleSelect(facility.id)}
                  aria-label={`Select ${displayPlaceName(facility.name)}`}
                  className="h-3.5 w-3.5 accent-[var(--color-primary)]"
                />
              </Td>
              <Td>
                <Link
                  to={`/facilities/${facility.id}`}
                  title={facility.name}
                  onClick={(event) => event.stopPropagation()}
                  className="text-[12px] font-semibold text-primary-ink transition hover:text-primary-strong"
                >
                  {displayPlaceName(facility.name)}
                </Link>
              </Td>
              <Td>
                <span
                  className="block max-w-[180px] truncate text-[11px] text-muted"
                  title={facility.address}
                >
                  {displayPlaceName(facility.address)}
                </span>
              </Td>
              <Td>
                <StatusPill status={facility.status} />
              </Td>
              <Td>
                <div className="min-w-[110px]">
                  <p className="text-right text-[11px] text-muted">
                    <span className="font-semibold text-ink-soft">{facility.occupied ?? 0}</span>
                    /{facility.maxCapacity}
                    <span className="ml-1.5 text-[10px]">· {facility.families ?? 0} fam.</span>
                  </p>
                  <div
                    role="img"
                    aria-label={`${pct} percent full`}
                    className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
                  >
                    <div
                      className="h-full min-w-[3px] rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Td>
              <Td className="text-right">
                <span className="text-[11px] text-muted">{facility.staffCount ?? 0}</span>
              </Td>
              <Td>
                <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                  <Link
                    to={`/facilities/${facility.id}`}
                    className="text-[11px] font-semibold text-primary-ink transition hover:text-primary-strong"
                  >
                    Manage
                  </Link>
                  <button
                    type="button"
                    onClick={() => onToggle(facility)}
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold transition ${
                      showDeleted
                        ? "text-success hover:text-success-strong"
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
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={7}>
            <PaginationBar
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onChange={onPage}
            />
          </td>
        </tr>
      </tfoot>
    </TableShell>
  );
};

export default FacilitiesTable;
