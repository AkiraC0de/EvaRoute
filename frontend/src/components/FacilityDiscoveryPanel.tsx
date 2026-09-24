import type { ChangeEvent } from 'react';
import type { Facility, FacilityStatus } from '../types/facility';
import CenterDistance from './primitives/CenterDistance';
import CenterStatusBadge from './primitives/CenterStatusBadge';

export type FacilityStatusFilter = 'ALL' | FacilityStatus;

interface FacilityDiscoveryPanelProps {
  facilities: Facility[];
  totalFacilities: number;
  query: string;
  statusFilter: FacilityStatusFilter;
  onQueryChange: (query: string) => void;
  onStatusFilterChange: (filter: FacilityStatusFilter) => void;
  onSelect: (facility: Facility) => void;
  onClearFilters: () => void;
}

const statusFilters: Array<{ value: FacilityStatusFilter; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'UNAVAILABLE', label: 'Unavailable' },
];

export default function FacilityDiscoveryPanel({
  facilities,
  totalFacilities,
  query,
  statusFilter,
  onQueryChange,
  onStatusFilterChange,
  onSelect,
  onClearFilters,
}: FacilityDiscoveryPanelProps) {
  const hasFilters = query.trim().length > 0 || statusFilter !== 'ALL';

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value);
  };

  return (
    <div className="facility-discovery-panel">
      <div className="facility-discovery-header">
        <div>
          <p className="facility-discovery-kicker">EvaRoute</p>
          <h2 className="text-[var(--font-size-lg)] font-semibold text-[var(--color-text-primary)]">
            Nearby Evacuation Centers
          </h2>
        </div>
        <span className="facility-result-count" aria-live="polite">
          {facilities.length} of {totalFacilities}
        </span>
      </div>

      <div className="facility-search-wrap">
        <svg className="facility-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Search evacuation centers near you..."
          value={query}
          onChange={handleSearchChange}
          className="search-input facility-search-input"
          aria-label="Search evacuation centers"
        />
      </div>

      <div className="facility-filter-row" role="group" aria-label="Filter evacuation centers by status">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`facility-filter ${statusFilter === filter.value ? 'active' : ''}`}
            onClick={() => onStatusFilterChange(filter.value)}
            aria-pressed={statusFilter === filter.value}
          >
            {filter.value !== 'ALL' && <span className={`facility-filter-dot ${filter.value.toLowerCase()}`} aria-hidden="true" />}
            {filter.label}
          </button>
        ))}
      </div>

      <div className="facility-list" aria-live="polite">
        {facilities.map((facility) => (
          <button
            key={facility.id}
            type="button"
            className="facility-discovery-card clay-card-interactive"
            onClick={() => onSelect(facility)}
            aria-label={`Select ${facility.name}`}
          >
            <div className="facility-card-topline">
              <div className="min-w-0 text-left">
                <h3 className="facility-card-title">{facility.name}</h3>
                <p className="facility-card-address">{facility.address}</p>
              </div>
              <CenterStatusBadge status={facility.status} />
            </div>
            <div className="facility-card-meta">
              <CenterDistance distance={facility.distance ?? 0} />
              <span className="facility-card-capacity">{facility.maxCapacity.toLocaleString()} spaces</span>
              <span className="facility-card-detail">Details <span aria-hidden="true">›</span></span>
            </div>
          </button>
        ))}

        {facilities.length === 0 && (
          <div className="facility-empty-state">
            <div className="facility-empty-icon" aria-hidden="true">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="M20 20l-4-4" />
              </svg>
            </div>
            <h3>No evacuation centers found</h3>
            <p>Try a different name or clear the current filters.</p>
            {hasFilters && (
              <button type="button" className="facility-clear-button" onClick={onClearFilters}>
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      <p className="facility-discovery-footer">
        {facilities.length === 0 ? 'No matching centers' : `${facilities.length} center${facilities.length === 1 ? '' : 's'} available`}
      </p>
    </div>
  );
}
