import SectionCard from "./SectionCard";

/** Compact figure — an inset statistic in the section band. */
const MiniStat = ({ label, value, caption }) => (
  <div className="rounded-md border border-line bg-surface-2 px-4 py-3">
    <p className="label-micro text-muted">{label}</p>
    <p className="mt-0.5 text-[17px] font-bold leading-5 text-ink">{value}</p>
    {caption && <p className="mt-0.5 text-micro text-muted">{caption}</p>}
  </div>
);

/** At-a-glance card — rolling 24-hour window plus this week's volume.
 *  Every stat carries its own window in the label (the old "Last 24 hours"
 *  title mixed windows and read as a bug). */
const Last24hCard = ({ summary }) => (
  <SectionCard title="At a glance" meta="Rolling 24-hour window plus weekly volume.">
    <div className="grid grid-cols-2 gap-3">
      <MiniStat label="Check-ins (24h)" value={summary.activity.last24h.checkIns} />
      <MiniStat label="Check-outs (24h)" value={summary.activity.last24h.checkOuts} />
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
