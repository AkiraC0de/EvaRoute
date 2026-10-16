import FacilityOverviewMap from "../map/FacilityOverviewMap";

/**
 * Facilities map card — the geographic overview shown above the table.
 * `onView(facilityId)` fires when a marker popup's "View details" is clicked.
 */
const FacilitiesMapCard = ({ facilities, onView }) => (
  <div className="rounded-clay bg-surface p-4 mb-4 shadow-clay">
    <h2 className="text-[11px] font-bold text-ink-soft">Facility map</h2>
    <p className="mt-1 text-[9px] text-muted">
      {facilities.length} {facilities.length === 1 ? "facility" : "facilities"} · click a
      marker for details
    </p>
    <div className="mt-3">
      <FacilityOverviewMap facilities={facilities} height={420} onView={onView} />
    </div>
  </div>
);

export default FacilitiesMapCard;
