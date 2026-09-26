import { type ReactNode, type ChangeEvent } from 'react';
import { FACILITY_STATUS_META, type Facility, type FacilityStatus } from '../types/facility';
import type { FacilityStatusFilter } from './FacilityDiscoveryPanel';

interface FacilitySearchFilterOverlayProps {
  query: string;
  facilities: Facility[];
  statusFilter: FacilityStatusFilter;
  onQueryChange: (query: string) => void;
  onStatusFilterChange: (filter: FacilityStatusFilter) => void;
  /** Optional slot rendered to the right of the search bar (e.g. recenter button). */
  recenterSlot?: ReactNode;
}

const statusFilters: Array<{ value: FacilityStatus; label: string; dotColor: string }> = [
  ...(['AVAILABLE', 'LIMITED', 'UNAVAILABLE'] as FacilityStatus[]).map((value) => ({
    value,
    label: FACILITY_STATUS_META[value].label,
    dotColor: FACILITY_STATUS_META[value].color,
  })),
];

export default function FacilitySearchFilterOverlay({
  query,
  facilities,
  statusFilter,
  onQueryChange,
  onStatusFilterChange,
  recenterSlot,
}: FacilitySearchFilterOverlayProps) {
  const statusCounts = facilities.reduce<Record<FacilityStatus, number>>((counts, facility) => {
    counts[facility.status] += 1;
    return counts;
  }, { AVAILABLE: 0, LIMITED: 0, UNAVAILABLE: 0 });

  return (
    <div className="search-filter-overlay">
      {/* Search bar row */}
      <div className="search-filter-top-row">
        <div className="search-filter-search-wrap">
          <svg
            className="search-filter-search-icon"
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => onQueryChange(e.target.value)}
            className="search-filter-search-input"
            aria-label="Search evacuation centers"
          />
        </div>
        {recenterSlot && (
          <div className="search-filter-recenter-slot">
            {recenterSlot}
          </div>
        )}
      </div>

      {/* Filter chips */}
      <div className="search-filter-chips" role="group" aria-label="Filter by status">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`search-filter-chip ${statusFilter === filter.value ? 'active' : ''}`}
            onClick={() => onStatusFilterChange(filter.value)}
            aria-pressed={statusFilter === filter.value}
          >
            <span
              className="search-filter-chip-dot"
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
