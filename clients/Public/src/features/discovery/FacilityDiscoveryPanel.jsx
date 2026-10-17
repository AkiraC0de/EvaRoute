import { motion } from 'motion/react';
import CenterStatusBadge from '../facility/CenterStatusBadge';
import CenterDistance from '../facility/CenterDistance';
import { staggerContainer, staggerItem, tapPress } from '../../lib/motion';

/**
 * FacilityDiscoveryPanel — the "Nearby Evacuation Centers" list.
 *
 * Exactly one empty state is ever shown, chosen by cause: filtered-out
 * results, nothing in the default radius, or nothing even after expanding.
 */
export default function FacilityDiscoveryPanel({
  facilities,
  totalFacilities,
  onSelect,
  showSearchAndFilters = false,
  searchQuery = '',
  statusFilter = 'ALL',
  onQueryChange,
  onStatusFilterChange,
  loading = false,
  error = null,
  searchRadiusKm = null,
  onExpandSearch,
}) {
  const statusOptions = [
    { value: 'ALL', label: 'All' },
    { value: 'AVAILABLE', label: 'Open' },
    { value: 'LIMITED', label: 'Limited' },
    { value: 'UNAVAILABLE', label: 'Full' },
  ];

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4 md:h-full">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
        <h2 className="text-[18px] font-bold leading-tight tracking-tight text-ink">Nearby Evacuation Centers</h2>
        <span className="shrink-0 rounded-full bg-sunken px-[9px] py-[5px] text-[11px] font-semibold text-muted">
          {totalFacilities} nearby
        </span>
      </div>

      {/* Optional in-panel search + filters */}
      {showSearchAndFilters && (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Search centers..."
            value={searchQuery}
            onChange={(e) => onQueryChange?.(e.target.value)}
            className="h-10 w-full rounded-full bg-sunken px-4 text-[13px] text-ink shadow-clay-inset outline-none placeholder:text-muted-dim focus:ring-2 focus:ring-accent"
            aria-label="Search centers"
          />
          <div className="flex flex-wrap gap-1 p-0.5">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={[
                  'motion-safe-transform inline-flex min-h-8 items-center rounded-full px-[11px] py-1.5 text-[11px] font-semibold transition',
                  statusFilter === option.value
                    ? 'bg-accent-soft text-accent shadow-clay-xs'
                    : 'bg-surface text-muted shadow-clay-xs hover:-translate-y-px hover:text-ink',
                ].join(' ')}
                onClick={() => onStatusFilterChange?.(option.value)}
                aria-pressed={statusFilter === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid min-h-0 grid-cols-1 grid-rows-[min-content] content-start gap-3 overflow-y-auto overflow-x-hidden p-0.5 md:flex-1"
      >
        {facilities.map((facility) => {
          const hasDistance = facility.distance != null && facility.distance > 0;
          return (
            <motion.button
              key={facility.id}
              variants={staggerItem}
              {...tapPress}
              type="button"
              className="focus-ring group w-full rounded-clay-lg bg-surface p-4 text-left text-inherit shadow-clay transition hover:shadow-clay-lg"
              onClick={() => onSelect(facility)}
            >
              <div className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-start gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-clay-sm bg-accent-soft text-accent" aria-hidden="true">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h8v6M9 10h.01M15 10h.01" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <h3 className="break-words text-[15px] font-semibold leading-tight text-ink">{facility.name}</h3>
                  <p className="mt-[3px] break-words text-[11px] capitalize leading-snug text-muted">{facility.address}</p>
                </div>
                <CenterStatusBadge status={facility.status} />
              </div>

              <div className="mt-4 grid grid-cols-[repeat(3,minmax(0,1fr))_auto] items-end gap-2 border-t border-line pt-2">
                <div className="grid min-w-0 gap-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-dim">Distance</span>
                  <span className="overflow-hidden truncate whitespace-nowrap text-[11px] font-semibold text-muted">
                    {hasDistance ? <CenterDistance distance={facility.distance} className="text-[11px] font-semibold text-muted" /> : '—'}
                  </span>
                </div>
                <div className="grid min-w-0 gap-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-dim">ETA</span>
                  <span className="overflow-hidden truncate whitespace-nowrap text-[11px] font-semibold text-muted">
                    {hasDistance ? `${Math.max(1, Math.round(facility.distance / 0.2))} min` : '—'}
                  </span>
                </div>
                <div className="grid min-w-0 gap-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-dim">Capacity</span>
                  <span className="overflow-hidden truncate whitespace-nowrap text-[11px] font-semibold text-muted">
                    {facility.maxCapacity.toLocaleString()} max
                  </span>
                </div>
                <span className="ml-auto rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                  Details <span aria-hidden="true">›</span>
                </span>
              </div>
            </motion.button>
          );
        })}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-10 text-[13px] text-muted">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" d="M12 3a9 9 0 1 1-6.36 2.64" />
            </svg>
            Loading centers…
          </div>
        )}

        {/* One empty state, chosen by cause — never stacked. */}
        {!loading && !error && facilities.length === 0 && totalFacilities > 0 && (
          <div className="flex flex-col items-center px-4 py-8 text-center text-muted">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-sunken text-accent shadow-clay-inset" aria-hidden="true">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 20l-4-4" />
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-ink">No evacuation centers found</h3>
            <p className="mt-1 text-[13px] leading-snug">Try a different name or clear the current filters.</p>
          </div>
        )}
      </motion.div>

      {/* Radius empty state (nothing within the default radius) */}
      {!loading && !error && totalFacilities === 0 && searchRadiusKm === null && (
        <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
          <p className="text-[13px] leading-relaxed text-muted-dim">No centers found within the default 10 km radius.</p>
          <button
            type="button"
            className="motion-safe-transform inline-flex items-center justify-center rounded-full bg-accent-soft px-6 py-2 text-[13px] font-semibold text-accent shadow-clay-xs transition hover:-translate-y-px hover:bg-accent hover:text-white hover:shadow-clay"
            onClick={onExpandSearch}
          >
            Search up to 200 km
          </button>
        </div>
      )}

      {/* Expanded-radius empty state */}
      {!loading && !error && totalFacilities === 0 && searchRadiusKm !== null && (
        <div className="flex flex-col items-center px-4 py-8 text-center text-muted">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-sunken text-accent shadow-clay-inset" aria-hidden="true">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 20l-4-4" />
            </svg>
          </div>
          <h3 className="text-[15px] font-semibold text-ink">No evacuation centers found</h3>
          <p className="mt-1 text-[13px] leading-snug">Nothing within 200 km of your location.</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center px-4 py-8 text-center">
          <h3 className="text-[15px] font-semibold text-ink">Centers unavailable</h3>
          <p className="mt-1 text-[13px] leading-snug text-muted">{error}</p>
        </div>
      )}

      <p className="text-center text-[11px] text-muted-dim">
        {loading
          ? 'Loading…'
          : error
            ? 'Centers unavailable'
            : facilities.length === 0
              ? ''
              : `${facilities.length} center${facilities.length === 1 ? '' : 's'} available`}
      </p>
    </div>
  );
}
