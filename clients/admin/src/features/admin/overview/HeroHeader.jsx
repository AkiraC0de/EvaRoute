import { Link } from "react-router-dom";
import { Building2, History as HistoryIcon, UserPlus } from "lucide-react";
import Button from "../../../components/ui/Button";

/** Hero header — identity, network pills and quick actions. */
const HeroHeader = ({ today, greeting, firstName, summary, occupancyPct }) => (
  <header className="relative overflow-hidden rounded-clay bg-gradient-to-br from-accent to-accent-strong p-6 shadow-2xs">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/25 blur-2xl"
    />
    <div className="relative flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[1px] text-white">
          {today}
        </p>
        <h1 className="mt-1 text-[22px] font-bold leading-tight text-white">
          {greeting}, {firstName}
        </h1>
        <p className="mt-1 text-[13px] text-white">
          Network operations at a glance — occupancy, staffing and activity.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold text-ink-soft shadow-clay-xs">
            {summary?.facilities.total ?? "—"} facilities
          </span>
          <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold text-ink-soft shadow-clay-xs">
            {summary?.occupants.families ?? "—"} families on site
          </span>
          <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-accent-strong">
            {occupancyPct}% occupied
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/facilities">
          <Button variant="onAccentGhost" size="md" className="inline-flex items-center gap-1.5">
            <Building2 size={13} strokeWidth={1.9} aria-hidden="true" /> Facilities
          </Button>
        </Link>
        <Link to="/staff">
          <Button variant="onAccentGhost" size="md" className="inline-flex items-center gap-1.5">
            <UserPlus size={13} strokeWidth={1.9} aria-hidden="true" /> Staff
          </Button>
        </Link>
        <Link to="/history">
          <Button variant="onAccent" size="md" className="inline-flex items-center gap-1.5">
            <HistoryIcon size={13} strokeWidth={1.9} aria-hidden="true" /> View history
          </Button>
        </Link>
      </div>
    </div>
  </header>
);

export default HeroHeader;
