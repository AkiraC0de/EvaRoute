import CheckInForm from "./CheckInForm";
import HouseholdList from "./HouseholdList";
import RecentHouseholdActivity from "./RecentHouseholdActivity";

/**
 * Operational band below the hero. The household list takes the WIDE left
 * column and the check-in form + movement trail stack in the narrow right
 * one, so the band's column seam lines up exactly with the hero band's
 * (meter | metric wall) above — one shared grid split for the whole page.
 * On small screens it stacks form-first (order utilities) for operational
 * speed. Presentational — the page owns the check-in ticket and the
 * checkout busy state.
 */
const OccupancyGrid = ({ facilityId, occupancy, stays, busy, onCheckIn, onCheckOut }) => (
  <div className="grid items-start gap-4 lg:grid-cols-[1.45fr_1fr]">
    <div className="order-2 lg:order-1">
      <HouseholdList stays={stays} busy={busy} onCheckOut={onCheckOut} />
    </div>
    <div className="order-1 space-y-4 lg:order-2">
      <CheckInForm remaining={occupancy.remaining} onCheckIn={onCheckIn} />
      <RecentHouseholdActivity facilityId={facilityId} />
    </div>
  </div>
);

export default OccupancyGrid;
