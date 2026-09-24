import type { Facility } from '../types/facility';
import CapacityProgress from './primitives/CapacityProgress';
import CenterStatusBadge from './primitives/CenterStatusBadge';
import PillButton from './primitives/PillButton';

interface FacilityDetailSidebarProps {
  facility: Facility;
  distance?: number;
  onBack: () => void;
  onGetRoute: () => void;
}

export default function FacilityDetailSidebar({
  facility,
  distance,
  onBack,
  onGetRoute,
}: FacilityDetailSidebarProps) {
  return (
    <div className="facility-detail-sidebar">
      <div className="facility-detail-header">
        <div className="min-w-0">
          <p className="facility-discovery-kicker">Selected center</p>
          <h2 className="facility-detail-title">{facility.name}</h2>
          <p className="facility-detail-address">{facility.address}</p>
        </div>
        <button type="button" className="facility-detail-close" onClick={onBack} aria-label="Back to evacuation centers" title="Back to evacuation centers">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="facility-detail-summary">
        <CenterStatusBadge status={facility.status} />
        <div className="facility-detail-distance">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
            <circle cx="12" cy="12" r="8" />
            <path strokeLinecap="round" d="M12 8v4l2.5 2" />
          </svg>
          {distance != null ? `${distance.toFixed(1)} km away` : 'Distance unavailable'}
        </div>
      </div>

      <section className="facility-detail-section facility-detail-occupancy" aria-labelledby="facility-capacity-heading">
        <div className="facility-detail-section-heading">
          <h3 id="facility-capacity-heading">Capacity</h3>
          <span>{facility.maxCapacity.toLocaleString()} spaces max</span>
        </div>
        <CapacityProgress current={undefined} max={facility.maxCapacity} showLabel={false} className="w-full" />
        <p className="facility-detail-muted">Current occupancy data is unavailable.</p>
      </section>

      {facility.note && (
        <section className="facility-detail-section" aria-labelledby="facility-description-heading">
          <h3 id="facility-description-heading">About this center</h3>
          <p className="facility-detail-copy">{facility.note}</p>
        </section>
      )}

      <section className="facility-detail-section facility-detail-unavailable" aria-labelledby="facility-amenities-heading">
        <h3 id="facility-amenities-heading">Amenities</h3>
        <p className="facility-detail-muted">Amenity information is not available for this center yet.</p>
      </section>

      <div className="facility-detail-actions">
        <PillButton variant="secondary" className="w-full" onClick={onBack}>
          Back to centers
        </PillButton>
        <PillButton variant="primary" className="w-full" onClick={onGetRoute}>
          Get route
        </PillButton>
      </div>
    </div>
  );
}
