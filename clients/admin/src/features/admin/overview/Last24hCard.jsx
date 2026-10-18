import SectionCard from "./SectionCard";

/** Compact figure — an inset statistic (spec §4). */
const MiniStat = ({ label, value, caption }) => (
  <div className="rounded-clay-sm bg-sunken px-4 py-3 shadow-clay-inset">
    <p className="text-[9px] font-semibold uppercase tracking-[0.5px] text-muted">
      {label}
    </p>
    <p className="mt-0.5 text-[17px] font-bold leading-5 text-ink">{value}</p>
    {caption && <p className="mt-0.5 text-[10px] text-muted">{caption}</p>}
  </div>
);

/** Last-24h card — rolling-window strip plus this week's volume. */
const Last24hCard = ({ summary }) => (
  <SectionCard title="Last 24 hours" meta="Rolling window, plus this week's volume.">
    <div className="grid grid-cols-2 gap-3">
      <MiniStat label="Check-ins" value={summary.activity.last24h.checkIns} />
      <MiniStat label="Check-outs" value={summary.activity.last24h.checkOuts} />
      <MiniStat
        label="Events (7 days)"
        value={summary.activity.last7d.events}
        caption="all recorded actions"
      />
      <MiniStat
        label="Unassigned staff"
        value={summary.staff.unassigned}
        caption="not yet at a facility"
      />
    </div>
  </SectionCard>
);

export default Last24hCard;
