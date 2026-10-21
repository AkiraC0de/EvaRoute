import { Building2, Gauge, Users, UserCheck } from "lucide-react";
import { SkeletonStatCard } from "../../../components/ui/Skeleton";
import StatusPanel from "../../../components/ui/StatusPanel";
import StatCard from "./StatCard";
import { GRID } from "./overviewStyles";

/**
 * KPI wall — the hero band's supporting metric cards, one per category
 * meaning (navy = capacity, teal = people, warm = places, neutral =
 * records). Network occupancy itself lives in the hero band above, and the
 * facility-state counts live in the hero chips — nothing repeats here.
 * Includes the loading skeleton and the summary-error state.
 */
const StatRow = ({ error, loading, summary, reload }) => (
  <>
    {error && (
      <StatusPanel tone="error" title="Could not load the dashboard" onRetry={reload}>
        {error.message}
      </StatusPanel>
    )}
    {loading && !error && (
      <div className={GRID} role="status" aria-label="Loading dashboard">
        {[0, 1, 2, 3].map((n) => (
          <SkeletonStatCard key={n} />
        ))}
      </div>
    )}
    {summary && (
      <div className={GRID}>
        <StatCard
          icon={<Gauge size={20} strokeWidth={1.9} />}
          tone="primary"
          label="Capacity"
          value={summary.capacity.total}
          caption="places across the network"
        />
        <StatCard
          icon={<Users size={20} strokeWidth={1.9} />}
          tone="secondary"
          label="People on site"
          value={summary.occupants.total}
          caption={`${summary.occupants.families} families · ${summary.occupants.children} children, ${summary.occupants.adults} adults`}
        />
        <StatCard
          icon={<Building2 size={20} strokeWidth={1.9} />}
          tone="warm"
          label="Facilities"
          value={summary.facilities.total}
          caption="registered evacuation centers"
        />
        <StatCard
          icon={<UserCheck size={20} strokeWidth={1.9} />}
          tone="neutral"
          label="Staff accounts"
          value={summary.staff.total}
          caption={`${summary.staff.active} active · ${summary.staff.disabled} disabled`}
        />
      </div>
    )}
  </>
);

export default StatRow;
