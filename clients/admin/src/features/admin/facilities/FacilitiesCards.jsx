import { Link } from "react-router-dom";
import { RotateCcw, Trash2 } from "../../../components/icons/evaIcons";
import Checkbox from "../../../components/ui/Checkbox";
import StatusPill from "../../../components/ui/StatusPill";
import PaginationBar from "../../activity/PaginationBar";
import { displayPlaceName } from "../../../lib/utils";

/**
 * Facilities cards — the registry as a responsive card grid instead of the
 * old table (the table forced horizontal scrolling in split view to reach
 * the far columns and the action buttons). Per-card bulk selection (the
 * page's bulk bar reacts to `selectedIds`), the list⇄map link (hover rings
 * the marker, clicking the card selects it on the map — the name link and
 * the actions still navigate/act), the occupancy meter with its numbers in
 * text, and the pagination bar. Cards are content-height; the grid keeps
 * explicit responsive columns so a lone card keeps its width at any split.
 */
const FacilitiesCards = ({
  facilities,
  showDeleted,
  onToggle,
  hoverId = null,
  selectedId = null,
  onHover = () => {},
  onSelect = () => {},
  selectedIds = new Set(),
  onToggleSelect = () => {},
  page = 1,
  totalPages = 1,
  total = 0,
  pageSize = 10,
  onPage = () => {},
}) => {
  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {facilities.map((facility) => {
          const name = displayPlaceName(facility.name);
          const pct =
            facility.maxCapacity > 0
              ? Math.min(100, Math.round(((facility.occupied ?? 0) / facility.maxCapacity) * 100))
              : 0;
          return (
            <div
              key={facility.id}
              onMouseEnter={() => onHover(facility.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(facility.id)}
              className={`flex cursor-pointer flex-col gap-2.5 rounded-lg border bg-surface p-3.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink ${
                selectedId === facility.id
                  ? "border-primary-strong bg-primary-soft/60"
                  : hoverId === facility.id
                    ? "border-line-strong bg-surface-2"
                    : "border-line"
              }`}
            >
              {/* Identity — selection box, name link, availability right */}
              <div className="flex items-center gap-2.5">
                <span onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.has(facility.id)}
                    onChange={() => onToggleSelect(facility.id)}
                    ariaLabel={`Select ${name}`}
                  />
                </span>
                <Link
                  to={`/facilities/${facility.id}`}
                  title={facility.name}
                  onClick={(event) => event.stopPropagation()}
                  className="min-w-0 flex-1 truncate text-[12px] font-semibold text-primary-ink transition hover:text-primary-strong"
                >
                  {name}
                </Link>
                <StatusPill status={facility.status} />
              </div>

              <p
                className="truncate text-[11px] text-muted"
                title={facility.address}
              >
                {displayPlaceName(facility.address)}
              </p>

              {/* Occupancy — meter paired with its numbers in text */}
              <div>
                <p className="text-[11px] text-muted">
                  <span className="font-semibold text-ink-soft">
                    {facility.occupied ?? 0}
                  </span>
                  /{facility.maxCapacity} places
                  <span className="ml-1.5">
                    · <span className="font-semibold text-ink-soft">{facility.families ?? 0}</span> fam.
                  </span>
                  <span className="ml-1.5">
                    · <span className="font-semibold text-ink-soft">{facility.staffCount ?? 0}</span> staff
                  </span>
                </p>
                <div
                  role="img"
                  aria-label={`${pct} percent full`}
                  className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
                >
                  <div
                    className="h-full min-w-[3px] rounded-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Actions — the destructive one isolated at the right */}
              <div
                className="mt-auto flex items-center gap-2 border-t border-line pt-2.5"
                onClick={(event) => event.stopPropagation()}
              >
                <Link
                  to={`/facilities/${facility.id}`}
                  className="inline-flex min-h-8 items-center rounded-md px-2 text-[11px] font-semibold text-primary-ink transition hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
                >
                  Manage
                </Link>
                <button
                  type="button"
                  onClick={() => onToggle(facility)}
                  title={showDeleted ? `Restore ${name}` : `Delete ${name}`}
                  className={`ml-auto inline-flex min-h-8 items-center gap-1 rounded-md px-2.5 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink ${
                    showDeleted
                      ? "text-success hover:bg-success-soft"
                      : "text-danger hover:bg-danger-soft"
                  }`}
                >
                  {showDeleted ? (
                    <>
                      <RotateCcw size={11} strokeWidth={2} /> Restore
                    </>
                  ) : (
                    <>
                      <Trash2 size={11} strokeWidth={2} /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3">
        <PaginationBar
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onChange={onPage}
        />
      </div>
    </div>
  );
};

export default FacilitiesCards;
