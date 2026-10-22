import CheckInsList from "../../occupancy/CheckInsList";
import DetailSection from "./DetailSection";

/**
 * Checked-in evacuees — occupancy line, check-in form beside the check-ins list.
 *
 * `onCheckOutMany` is the bulk check-out seam: the list needs it to offer the
 * selection flow at all (without it CheckInsList renders read-only), so it is
 * forwarded beside the single `onCheckOut`.
 */
const FacilityOccupancySection = ({ occupancy, stays, busy, onCheckOut, onCheckOutMany }) => (
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
      onCheckOutMany={onCheckOutMany}
    />
  </DetailSection>
);

export default FacilityOccupancySection;
