import { Link } from "react-router-dom";
import ActivityFeed from "../activity/ActivityFeed";

/** Recent activity card — latest facility events with a shortcut into history. */
const FacilityRecentActivityCard = ({ facilityId }) => (
  <div className="mt-4 rounded-clay bg-surface p-4 shadow-clay">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[13px] font-bold text-ink-soft">Recent activity</h2>
      <Link
        to="/history"
        className="text-[11px] font-semibold text-accent transition hover:text-accent-strong"
      >
        View full history →
      </Link>
    </div>
    <div className="overflow-hidden rounded-3xl border border-line">
      <ActivityFeed query={{ facilityId }} limit={5} compact />
    </div>
  </div>
);

export default FacilityRecentActivityCard;
