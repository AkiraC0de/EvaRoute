import type { Facility } from '../types/facility';
import CapacityProgress from './primitives/CapacityProgress';
import CenterStatusBadge from './primitives/CenterStatusBadge';
import PillButton from './primitives/PillButton';
import FacilityIconGrid from './primitives/FacilityIconGrid';

interface FacilityDetailSidebarProps {
  facility: Facility;
  distance?: number;
  onBack: () => void;
  onGetRoute: () => void;
  /** Derived occupancy from backend (not yet available). */
  currentOccupancy?: number;
  /** Facility resource/amenity data for the icon grid. */
  resources?: Array<{ id: string; name?: string; type?: string }>;
}

export default function FacilityDetailSidebar({
  facility,
  distance,
  onBack,
  onGetRoute,
  currentOccupancy,
  resources,
}: FacilityDetailSidebarProps) {
  // Walking-speed ETA estimate (~12 km/h = 0.2 km/min).
  // This is an approximation — no real routing data available at this point.
  const etaMin = distance != null && distance > 0
    ? Math.round(distance / 0.2)
    : null;

  return (
    <div className="facility-detail-sidebar">
      <div className="facility-detail-header">
        <div className="min-w-0">
          <h2 className="facility-detail-title">{facility.name}</h2>
          <p className="facility-detail-address">{facility.address}</p>
        </div>
        {/* Circular X close button — matches Figma Frame 05 top-right close action */}
        <button
          type="button"
          className="facility-detail-close"
          onClick={onBack}
          aria-label="Close"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="facility-detail-summary">
        <CenterStatusBadge status={facility.status} fullLabel />
        <div className="facility-detail-distance">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
            <circle cx="12" cy="12" r="8" />
            <path strokeLinecap="round" d="M12 8v4l2.5 2" />
          </svg>
          {distance != null
            ? `${distance.toFixed(1)} km${etaMin != null ? ` · ${etaMin} min away` : ' away'}`
            : 'Distance unavailable'}
        </div>
      </div>

      <section className="facility-detail-section facility-detail-occupancy" aria-labelledby="facility-capacity-heading">
        <div className="facility-detail-section-heading">
          <h3 id="facility-capacity-heading">Capacity</h3>
          <span>{facility.maxCapacity.toLocaleString()} spaces max</span>
        </div>
        <div className="facility-capacity-detail">
          <CapacityProgress
            current={currentOccupancy}
            max={facility.maxCapacity}
            showSlotsLeft
            showPercentage
            className="w-full"
          />
        </div>
        {currentOccupancy == null && (
          <p className="facility-detail-muted">Current occupancy data is unavailable.</p>
        )}
      </section>

      {facility.note && (
        <section className="facility-detail-section" aria-labelledby="facility-description-heading">
          <h3 id="facility-description-heading">About this center</h3>
          <p className="facility-detail-copy">{facility.note}</p>
        </section>
      )}

      <section className="facility-detail-section facility-detail-amenities" aria-labelledby="facility-amenities-heading">
        <h3 id="facility-amenities-heading">Amenities</h3>
        <FacilityIconGrid resources={resources ?? undefined} className="w-full" />
      </section>

      {/* Footer actions — Figma Frame 05: Back (secondary, left) + Get Route (primary, right) side-by-side */}
      <div className="facility-detail-actions">
        <PillButton variant="secondary" className="w-full" onClick={onBack}>
          Back
        </PillButton>
        <PillButton variant="primary" className="w-full" onClick={onGetRoute}>
          Get Route
        </PillButton>
      </div>
    </div>
  );
}
