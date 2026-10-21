import { Link } from "react-router-dom";
import ActivityFeed from "../../activity/ActivityFeed";
import SectionCard from "./SectionCard";
import { FOCUS_RING } from "./overviewStyles";

/** Recent activity card — the shared feed with a link to full history. */
const RecentActivityCard = () => (
  <SectionCard
    title="Recent activity"
    meta="Latest meaningful changes."
    action={
      <Link
        to="/history"
        className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-primary-ink transition hover:text-primary-strong ${FOCUS_RING}`}
      >
        View full history →
      </Link>
    }
  >
    <ActivityFeed limit={6} />
  </SectionCard>
);

export default RecentActivityCard;
