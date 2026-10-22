import { motion, useReducedMotion } from "motion/react";
import RollingNumber from "../../../components/ui/RollingNumber";
import { paperWipe } from "../../../components/ui/slideVariants";
import { Link } from "react-router-dom";
import { Building2, History as HistoryIcon, UserPlus } from "../../../components/icons/evaIcons";
import Button from "../../../components/ui/Button";
import HeroMapArt from "./HeroMapArt";

/** Hero band — the flat deep-navy panel carrying identity, the headline
 *  occupancy metric (the ONE place occupancy lives on this screen) and the
 *  quick actions. Its chips carry facility-state facts the KPI tiles do NOT
 *  repeat. Values render "—" until the summary is measured — a 0 in this UI
 *  is always a measured zero. */

/** One hero state chip — fact + label on a quiet dark pill (navy/30 keeps
 *  the white text AA wherever the map silhouette lightens the band). */
const HeroChip = ({ value, label }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-navy/30 px-2.5 py-1 text-[11px] font-semibold text-white">
    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-white/70" />
    <span>{value}</span>
    <span className="font-normal text-white/90">{label}</span>
  </span>
);

const HeroHeader = ({ today, greeting, firstName, summary, occupancyPct }) => {
  const reduceMotion = useReducedMotion();
  const wipe = paperWipe(reduceMotion);

  return (
  <header className="relative overflow-hidden rounded-lg bg-surface-2 p-6">
    {/* Color layer: paper-wipe reveal from the top-left corner. The
        Philippines vector rides INSIDE it on the bright right side so the
        sweep reveals the map together with the gradient. */}
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 bg-primary-strong"
      style={{ backgroundImage: "var(--hero-gradient)" }}
      {...wipe.overlay}
    >
      <HeroMapArt className="absolute right-[4%] top-1/2 h-[145%] aspect-[5807/10000] -translate-y-1/2 opacity-30" />
    </motion.div>
    <motion.div className="relative z-10 text-white" {...wipe.content}>
    {/* Identity + quick actions */}
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[1px] text-white/90">
          {today}
        </p>
        <h1 className="mt-1 text-[22px] font-bold leading-tight text-white">
          {greeting}, {firstName}
        </h1>
        <p className="mt-1 text-[13px] text-white/90">
          Network operations at a glance — occupancy, staffing and activity.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/facilities">
          <Button variant="onPrimaryGhost" size="md" className="inline-flex min-h-11 items-center gap-1.5">
            <Building2 size={13} strokeWidth={1.9} aria-hidden="true" /> Facilities
          </Button>
        </Link>
        <Link to="/staff">
          <Button variant="onPrimaryGhost" size="md" className="inline-flex min-h-11 items-center gap-1.5">
            <UserPlus size={13} strokeWidth={1.9} aria-hidden="true" /> Staff
          </Button>
        </Link>
        <Link to="/history">
          <Button variant="onPrimary" size="md" className="inline-flex min-h-11 items-center gap-1.5">
            <HistoryIcon size={13} strokeWidth={1.9} aria-hidden="true" /> View history
          </Button>
        </Link>
      </div>
    </div>

    {/* Headline metric + facility-state chips */}
    <div className="mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[1px] text-white/90">
          Network occupancy
        </p>
        <p className="mt-1 text-[24px] font-bold leading-none text-white">
          {summary ? <RollingNumber value={`${occupancyPct}%`} /> : "—"}
        </p>
        <p className="mt-1.5 text-[11px] text-white/90">
          {summary
            ? `${summary.capacity.occupied} of ${summary.capacity.total} places taken`
            : "Waiting for live data…"}
        </p>
        <div className="mt-2.5 h-2 w-56 max-w-full overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: summary ? `${Math.min(Math.max(occupancyPct, 0), 100)}%` : "0%" }}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <HeroChip
          value={summary ? summary.facilities.byStatus.AVAILABLE ?? 0 : "—"}
          label="available"
        />
        <HeroChip
          value={summary ? summary.facilities.byStatus.LIMITED ?? 0 : "—"}
          label="limited"
        />
        <HeroChip
          value={summary ? summary.facilities.byStatus.UNAVAILABLE ?? 0 : "—"}
          label="unavailable"
        />
      </div>
    </div>
    </motion.div>
  </header>
  );
};

export default HeroHeader;
