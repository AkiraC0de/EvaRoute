import { Link } from "react-router-dom";
import { History } from "lucide-react";
import Card from "../../components/ui/Card";
import ActivityFeed from "../activity/ActivityFeed";

/** Recent movement — latest facility events with a shortcut into history. */
const FacilityRecentActivityCard = ({ facilityId }) => (
  <Card>
    <div className="mb-3 flex flex-wrap items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-2 text-muted"
      >
        <History size={15} strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <h2 className="text-[13px] font-bold text-ink-soft">Recent movement</h2>
        <p className="text-[11px] text-muted">Latest events at this facility</p>
      </div>
      <Link
        to="/history"
        className="ml-auto text-[11px] font-semibold text-primary-ink transition hover:text-primary-strong"
      >
        View full history →
      </Link>
    </div>
    <div className="overflow-hidden rounded-md border border-line">
      <ActivityFeed query={{ facilityId }} limit={5} compact />
    </div>
  </Card>
);

export default FacilityRecentActivityCard;
