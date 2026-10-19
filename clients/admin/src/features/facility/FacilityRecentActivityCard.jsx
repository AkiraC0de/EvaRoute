import { Link } from "react-router-dom";
import { History } from "lucide-react";
import ActivityFeed from "../activity/ActivityFeed";

/** Recent movement — latest facility events with a shortcut into history. */
const FacilityRecentActivityCard = ({ facilityId }) => (
  <div className="rounded-clay bg-surface p-4 shadow-clay">
    <div className="mb-3 flex flex-wrap items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-clay-sm bg-accent-soft text-accent"
      >
        <History size={15} strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <h2 className="text-[13px] font-bold text-ink-soft">Recent movement</h2>
        <p className="text-[10px] text-muted">Latest events at this facility</p>
      </div>
      <Link
        to="/history"
        className="ml-auto text-[11px] font-semibold text-accent transition hover:text-accent-strong"
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
