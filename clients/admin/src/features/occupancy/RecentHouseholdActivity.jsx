import Card from "../../components/ui/Card";
import ActivityFeed from "../activity/ActivityFeed";

/**
 * Recent household movement for one facility — the check-in / check-out
 * trail, straight from the activity log (STAY_CHECKED_IN / STAY_CHECKED_OUT).
 * Reuses the shared compact feed instead of a second stay query.
 */
const RecentHouseholdActivity = ({ facilityId }) => (
  <Card className="mt-4">
    <div className="mb-2 flex items-center justify-between gap-2">
      <h2 className="text-[12px] font-bold text-ink-soft">Recent check-ins &amp; check-outs</h2>
    </div>
    <ActivityFeed
      query={{ facilityId, action: "STAY_CHECKED_IN,STAY_CHECKED_OUT" }}
      limit={6}
    />
  </Card>
);

export default RecentHouseholdActivity;
