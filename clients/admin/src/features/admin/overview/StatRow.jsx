import { Building2, Gauge, Users, UserCheck } from "lucide-react";
import Button from "../../../components/ui/Button";
import Skeleton from "../../../components/ui/Skeleton";
import StatCard from "./StatCard";
import { CARD, GRID } from "./overviewStyles";

/** KPI row with its loading skeleton and summary-error state. */
const StatRow = ({ error, loading, summary, occupancyPct, reload }) => (
  <>
    {error && (
      <div className={CARD}>
        <p className="text-[13px] font-semibold text-ink-soft">Could not load the dashboard</p>
        <p className="mt-1 text-[12px] text-muted">{error.message}</p>
        <Button variant="neutral" size="sm" className="mt-3" onClick={reload}>
          Try again
        </Button>
      </div>
    )}
    {loading && !error && (
      <div className={GRID} role="status" aria-label="Loading dashboard">
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className={CARD}>
            <Skeleton className="h-2 w-16" />
            <Skeleton className="mt-3 h-6 w-20" />
            <Skeleton className="mt-3 h-2.5 w-24" />
          </div>
        ))}
      </div>
    )}
    {summary && (
      <div className={GRID}>
        <StatCard
          icon={<Gauge size={20} strokeWidth={1.9} />}
          tone="accent"
          label="Network occupancy"
          value={`${occupancyPct}%`}
          caption={`${summary.capacity.occupied} of ${summary.capacity.total} places taken`}
          meter={occupancyPct}
        />
        <StatCard
          icon={<Users size={20} strokeWidth={1.9} />}
          tone="success"
          label="People on site"
          value={summary.occupants.total}
          caption={`${summary.occupants.families} families · ${summary.occupants.children} children, ${summary.occupants.adults} adults`}
        />
        <StatCard
          icon={<Building2 size={20} strokeWidth={1.9} />}
          tone="warning"
          label="Facilities"
          value={summary.facilities.total}
          caption={`${summary.facilities.byStatus.AVAILABLE ?? 0} available · ${
            (summary.facilities.byStatus.UNAVAILABLE ?? 0) +
            (summary.facilities.byStatus.LIMITED ?? 0)
          } limited/unavailable`}
        />
        <StatCard
          icon={<UserCheck size={20} strokeWidth={1.9} />}
          tone="accent"
          label="Staff accounts"
          value={summary.staff.total}
          caption={`${summary.staff.active} active · ${summary.staff.disabled} disabled`}
        />
      </div>
    )}
  </>
);

export default StatRow;
