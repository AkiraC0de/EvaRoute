import { Link } from "react-router-dom";
import ActivityFeed from "../../activity/ActivityFeed";
import DetailSection from "./DetailSection";

/** Activity section — latest events with a shortcut into the full history. */
const FacilityActivitySection = ({ facilityId }) => (
  <DetailSection
    title="Activity"
    action={
      <Link
        to="/history"
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary-ink transition hover:text-primary-strong"
      >
        Open in history →
      </Link>
    }
  >
    <ActivityFeed query={{ facilityId }} limit={5} compact />
  </DetailSection>
);

export default FacilityActivitySection;
