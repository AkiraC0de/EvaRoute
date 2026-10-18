import CheckInForm from "../../occupancy/CheckInForm";
import HouseholdList from "../../occupancy/HouseholdList";
import DetailSection from "./DetailSection";

/** Checked-in evacuees — occupancy line, check-in form beside the household list. */
const FacilityOccupancySection = ({ occupancy, stays, busy, onCheckIn, onCheckOut }) => (
  <DetailSection title="Checked-in evacuees">
    {occupancy && (
      <p className="mb-3 text-[11px] text-muted">
        {occupancy.members} of {occupancy.maxCapacity} places occupied ·{" "}
        {occupancy.remaining} remaining
      </p>
    )}
    <div className="grid gap-4 md:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.55fr)]">
      <CheckInForm
        remaining={occupancy?.remaining ?? 0}
        onCheckIn={onCheckIn}
      />
      <HouseholdList
        stays={stays}
        busy={busy}
        onCheckOut={onCheckOut}
      />
    </div>
  </DetailSection>
);

export default FacilityOccupancySection;
