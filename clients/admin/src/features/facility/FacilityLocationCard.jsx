import FacilityOverviewMap from "../map/FacilityOverviewMap";

/** Read-only location card — the assigned facility on the overview map. */
const FacilityLocationCard = ({ facility }) => (
  <div className="mb-3 rounded-clay bg-surface p-4 shadow-clay">
    <h2 className="text-[13px] font-bold text-ink-soft">Facility location</h2>
    <p className="mt-1 text-[11px] text-muted">{facility.address}</p>
    <div className="mt-3">
      <FacilityOverviewMap facilities={[facility]} showLegend={false} height={220} />
    </div>
  </div>
);

export default FacilityLocationCard;
