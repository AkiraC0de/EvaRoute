import StatTile from "../../components/ui/StatTile";

/** Activity stats card — today's check-ins/outs plus the 7-day event total. */
const FacilityActivityStatsCard = ({ todayStats, weekStats }) => (
  <div className="mt-4 rounded-clay bg-surface p-4 shadow-clay">
    <h2 className="mb-3 text-[13px] font-bold text-ink-soft">Activity</h2>
    <div className="grid grid-cols-3 gap-2">
      <StatTile label="Check-ins today" value={todayStats.byAction.STAY_CHECKED_IN ?? 0} />
      <StatTile label="Check-outs today" value={todayStats.byAction.STAY_CHECKED_OUT ?? 0} />
      <StatTile label="Events (7 days)" value={weekStats.total} />
    </div>
  </div>
);

export default FacilityActivityStatsCard;
