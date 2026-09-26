import type { ChangeEvent } from 'react';
import { FACILITY_STATUS_META, type Facility, type FacilityStatus } from '../types/facility';
import CenterDistance from './primitives/CenterDistance';
import CenterStatusBadge from './primitives/CenterStatusBadge';

export type FacilityStatusFilter = 'ALL' | FacilityStatus;

interface FacilityDiscoveryPanelProps {
  facilities: Facility[];
  totalFacilities: number;
  onSelect: (facility: Facility) => void;
  /** Show search input + filter chips inside the panel (desktop only). */
  showSearchAndFilters?: boolean;
  /** Current search query (controlled from App.tsx). */
  searchQuery?: string;
  /** Current status filter (controlled from App.tsx). */
  statusFilter?: FacilityStatusFilter;
  /** Called when search query changes. */
  onQueryChange?: (query: string) => void;
  /** Called when status filter changes. */
  onStatusFilterChange?: (filter: FacilityStatusFilter) => void;
}

export default function FacilityDiscoveryPanel({
  facilities,
  totalFacilities,
  onSelect,
  showSearchAndFilters = false,
  searchQuery = '',
  statusFilter = 'ALL',
  onQueryChange,
  onStatusFilterChange,
}: FacilityDiscoveryPanelProps) {
  const statusFilters: Array<{ value: FacilityStatusFilter; label: string; dotColor: string }> = [
    { value: 'ALL', label: 'All', dotColor: 'var(--color-text-caption)' },
    ...(['AVAILABLE', 'LIMITED', 'UNAVAILABLE'] as FacilityStatus[]).map((value) => ({
      value,
      label: FACILITY_STATUS_META[value].label,
      dotColor: FACILITY_STATUS_META[value].color,
    })),
  ];

  return (
    <div className="facility-discovery-panel">
      {/* Search + filters (desktop only) */}
      {showSearchAndFilters && (
        <>
          <div className="facility-discovery-header">
            <div className="min-w-0">
              <h2 className="text-[var(--font-size-lg)] font-semibold text-[var(--color-text-primary)]">
                Nearby Evacuation Centers
              </h2>
            </div>
            <span className="facility-result-count" aria-live="polite">
              {facilities.length} nearby
            </span>
          </div>
          <div className="facility-search-wrap">
            <svg className="facility-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M20 20l-4-4" />
            </svg>
            <input
              className="search-input facility-search-input"
              type="text"
              placeholder="Search centers…"
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onQueryChange?.(e.target.value)}
              aria-label="Search evacuation centers"
            />
          </div>
          <div className="facility-filter-row" role="group" aria-label="Filter by status">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                type="button"
                className={`facility-filter ${statusFilter === f.value ? 'active' : ''}`}
                onClick={() => onStatusFilterChange?.(f.value)}
                aria-pressed={statusFilter === f.value}
              >
                <span className="facility-filter-dot" style={{ backgroundColor: f.dotColor }} aria-hidden="true" />
                {f.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Header (mobile / when no search/filters) */}
      {!showSearchAndFilters && (
        <div className="facility-discovery-header">
          <div className="min-w-0">
            <h2 className="text-[var(--font-size-lg)] font-semibold text-[var(--color-text-primary)]">
              Nearby Evacuation Centers
            </h2>
          </div>
          <span className="facility-result-count" aria-live="polite">
            {facilities.length} nearby
          </span>
        </div>
      )}

      {/* List */}
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
              <div className="facility-card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6M9 10h.01M15 10h.01" />
                </svg>
              </div>
              <div className="min-w-0 text-left">
                <h3 className="facility-card-title">{facility.name}</h3>
                <p className="facility-card-address">{facility.address}</p>
              </div>
              <CenterStatusBadge status={facility.status} />
            </div>
            <div className="facility-card-metrics" aria-label="Facility metrics">
              <div className="facility-card-metric">
                <span className="facility-card-metric-label">Distance</span>
                <CenterDistance distance={facility.distance ?? 0} className="facility-card-metric-value" />
              </div>
              <div className="facility-card-metric">
                <span className="facility-card-metric-label">ETA</span>
                <span className="facility-card-metric-value">
                  {facility.distance != null && facility.distance > 0 ? `${Math.max(1, Math.round(facility.distance / 0.2))} min` : '—'}
                </span>
              </div>
              <div className="facility-card-metric">
                <span className="facility-card-metric-label">Capacity</span>
                <span className="facility-card-metric-value">{facility.maxCapacity.toLocaleString()} max</span>
              </div>
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
          </div>
        )}
      </div>

      <p className="facility-discovery-footer">
        {facilities.length === 0 ? 'No matching centers' : `${facilities.length} center${facilities.length === 1 ? '' : 's'} available`}
      </p>
    </div>
  );
}
