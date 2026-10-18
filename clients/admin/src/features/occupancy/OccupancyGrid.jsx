import CheckInForm from "./CheckInForm";
import HouseholdList from "./HouseholdList";
import RecentHouseholdActivity from "./RecentHouseholdActivity";

/**
 * Operational grid: check-in form + recent movement in the left column, the
 * household list spanning both rows on the right so it gets the full height.
 * Stacks on small screens (form, recent, list) via the responsive columns
 * breakpoint. Presentational — the page owns the check-in ticket and the
 * checkout busy state.
 */
const OccupancyGrid = ({ facilityId, occupancy, stays, busy, onCheckIn, onCheckOut }) => (
  <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.4fr)] lg:grid-rows-[auto_1fr]">
    <div className="lg:col-start-1 lg:row-start-1">
      <CheckInForm remaining={occupancy.remaining} onCheckIn={onCheckIn} />
    </div>
    <div className="lg:col-start-1 lg:row-start-2">
      <RecentHouseholdActivity facilityId={facilityId} />
    </div>
    <div className="flex lg:col-start-2 lg:row-start-1 lg:row-span-2">
      <HouseholdList stays={stays} busy={busy} onCheckOut={onCheckOut} />
    </div>
  </div>
);

export default OccupancyGrid;
