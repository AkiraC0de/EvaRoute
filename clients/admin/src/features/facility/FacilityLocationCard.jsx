import { MapPin, Navigation } from "lucide-react";
import Card from "../../components/ui/Card";
import FacilityOverviewMap from "../map/FacilityOverviewMap";
import { formatCoords } from "../map/coordinateUtils";

/**
 * Read-only location card — the assigned facility on the overview map
 * (staff cannot edit coordinates here; coordinates editing lives in the
 * admin facility detail's edit mode). Warm (places) identity chip.
 */
const FacilityLocationCard = ({ facility }) => {
  // Formatted once: the address row and the coords chip share one value,
  // so a render never recomputes it (and the two can't disagree).
  const coords = formatCoords(facility.latitude, facility.longitude);

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-warm-soft text-warm-ink"
        >
          <MapPin size={15} strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[13px] font-bold text-ink-soft">Location</h2>
          <p className="text-[11px] text-muted">Where evacuees find you</p>
        </div>
      </div>
      <p className="mb-2 flex items-start gap-1.5 text-[11px] text-muted">
        <Navigation size={11} strokeWidth={1.9} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1">{facility.address}</span>
        {coords ? (
          <span className="shrink-0 font-mono text-[11px] text-muted-dim">{coords}</span>
        ) : null}
      </p>
      <FacilityOverviewMap facilities={[facility]} showLegend={false} height={220} />
    </Card>
  );
};

export default FacilityLocationCard;
