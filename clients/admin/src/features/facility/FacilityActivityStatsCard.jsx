import { LogIn, LogOut, Activity } from "lucide-react";
import StatTile from "../../components/ui/StatTile";

/**
 * Activity stats — today's check-ins/outs plus the rolling 7-day event
 * total, scoped server-side to this facility. Check-ins/outs are people
 * movement (secondary tint); the event total is a record count (neutral).
 */
const FacilityActivityStatsCard = ({ todayStats, weekStats }) => (
  <div className="rounded-lg border border-line bg-surface p-4">
    <div className="mb-3 flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-2 text-muted"
      >
        <Activity size={15} strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <h2 className="text-[13px] font-bold text-ink-soft">Activity</h2>
        <p className="text-[10px] text-muted">Today and the last 7 days</p>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <StatTile
        label="Check-ins"
        value={todayStats.byAction.STAY_CHECKED_IN ?? 0}
        icon={<LogIn size={13} strokeWidth={1.9} />}
        tone="secondary"
      />
      <StatTile
        label="Check-outs"
        value={todayStats.byAction.STAY_CHECKED_OUT ?? 0}
        icon={<LogOut size={13} strokeWidth={1.9} />}
        tone="secondary"
      />
      <StatTile
        label="Events"
        value={weekStats.total}
        icon={<Activity size={13} strokeWidth={1.9} />}
        tone="neutral"
      />
    </div>
  </div>
);

export default FacilityActivityStatsCard;
