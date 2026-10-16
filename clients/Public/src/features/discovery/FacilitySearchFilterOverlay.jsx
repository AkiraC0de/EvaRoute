import { FACILITY_STATUS_META } from '../../lib/facilityMeta';

const statusFilters = ['AVAILABLE', 'LIMITED', 'UNAVAILABLE'].map((value) => ({
  value,
  label: FACILITY_STATUS_META[value].label,
  dotColor: FACILITY_STATUS_META[value].color,
}));

export default function FacilitySearchFilterOverlay({
  query,
  facilities,
  statusFilter,
  onQueryChange,
  onStatusFilterChange,
  recenterSlot,
}) {
  const statusCounts = facilities.reduce(
    (counts, facility) => {
      counts[facility.status] += 1;
      return counts;
    },
    { AVAILABLE: 0, LIMITED: 0, UNAVAILABLE: 0 },
  );

  return (
    <div className="pointer-events-auto fixed inset-x-0 top-0 z-[29] flex flex-col gap-2 px-4 pt-2 md:inset-x-auto md:left-6 md:top-6 md:w-[480px] md:max-w-[calc(100vw-520px)] md:p-0">
      {/* Search bar row */}
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-dim"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search evacuation centers..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="h-11 w-full appearance-none rounded-full bg-surface py-0 pl-[42px] pr-4 text-[15px] text-ink shadow-clay-inset outline-none transition placeholder:text-muted-dim focus:ring-2 focus:ring-accent [&::-webkit-search-cancel-button]:appearance-none"
            aria-label="Search evacuation centers"
          />
        </div>
        {recenterSlot && <div className="flex shrink-0 items-center">{recenterSlot}</div>}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={[
              'motion-safe-transform inline-flex min-h-8 items-center gap-1.5 rounded-full px-[11px] py-1.5 text-[11px] font-semibold transition',
              statusFilter === filter.value
                ? 'bg-accent text-white shadow-clay-xs'
                : 'bg-surface text-muted shadow-clay-xs hover:-translate-y-px hover:text-ink',
            ].join(' ')}
            onClick={() => onStatusFilterChange(filter.value)}
            aria-pressed={statusFilter === filter.value}
          >
            <span
              className={`h-[7px] w-[7px] rounded-full ${statusFilter === filter.value ? 'shadow-[0_0_0_2px_rgba(255,255,255,0.9)]' : ''}`}
              style={{ backgroundColor: filter.dotColor }}
              aria-hidden="true"
            />
            {statusCounts[filter.value]} {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
