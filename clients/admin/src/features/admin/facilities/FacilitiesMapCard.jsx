import { MapPin } from "lucide-react";
import FacilityOverviewMap from "../../map/FacilityOverviewMap";

/**
 * Facilities map card — the geographic overview shown above the table. A
 * bordered flat panel: warm (places) identity chip on the header, then the
 * legible OSM map. `onView(facilityId)` fires when a marker popup's
 * "View details" is clicked.
 */
const FacilitiesMapCard = ({ facilities, onView }) => (
  <div className="mb-4 rounded-lg border border-line bg-surface p-4">
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-warm-soft text-warm-ink"
      >
        <MapPin size={15} strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <h2 className="text-[13px] font-bold text-ink-soft">Facility map</h2>
        <p className="text-[11px] text-muted">
          {facilities.length} {facilities.length === 1 ? "facility" : "facilities"} ·
          click a marker for details
        </p>
      </div>
    </div>
    <div className="mt-3">
      {/* 320px keeps the map useful without pushing the facilities table
          (the page's primary object) below the fold on laptop screens. */}
      <FacilityOverviewMap facilities={facilities} height={500} onView={onView} />
    </div>
  </div>
);

export default FacilitiesMapCard;
