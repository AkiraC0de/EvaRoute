import { History } from "lucide-react";
import Card from "../../components/ui/Card";
import ActivityFeed from "../activity/ActivityFeed";

/**
 * Recent household movement for one facility — the check-in / check-out
 * trail, straight from the activity log (STAY_CHECKED_IN / STAY_CHECKED_OUT).
 * Reuses the shared compact feed instead of a second stay query.
 */
const RecentHouseholdActivity = ({ facilityId, movementKey = 0 }) => (
  <Card className="h-full">
    <div className="mb-3 flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-ink"
      >
        <History size={15} strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <h2 className="text-[13px] font-bold text-ink-soft">Recent movement</h2>
        <p className="text-[10px] text-muted">Check-ins &amp; check-outs, latest first</p>
      </div>
    </div>
    {/* Keyed remount: a check-in/out elsewhere on the page re-fetches this
        trail (the activity log is a different source than the stays cache). */}
    <ActivityFeed
      key={movementKey}
      query={{ facilityId, action: "STAY_CHECKED_IN,STAY_CHECKED_OUT" }}
      limit={6}
    />
  </Card>
);

export default RecentHouseholdActivity;
