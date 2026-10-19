import CheckInsList from "../../occupancy/CheckInsList";
import DetailSection from "./DetailSection";

/** Checked-in evacuees — occupancy line, check-in form beside the check-ins list. */
const FacilityOccupancySection = ({ occupancy, stays, busy, onCheckOut }) => (
  <DetailSection title="Checked-in evacuees">
    {occupancy && (
      <p className="mb-3 text-[11px] text-muted">
        {occupancy.members} of {occupancy.maxCapacity} places occupied ·{" "}
        {occupancy.remaining} remaining
      </p>
    )}
    <CheckInsList
      stays={stays}
      busy={busy}
      onCheckOut={onCheckOut}
    />
  </DetailSection>
);

export default FacilityOccupancySection;
