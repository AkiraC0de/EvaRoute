import { Building2, UserCheck, ShieldCheck, ArrowLeftRight } from "lucide-react";
import RollingNumber from "../../../components/ui/RollingNumber";
import { SkeletonStatCard } from "../../../components/ui/Skeleton";
import { ICON_TONES } from "./overviewStyles";

/**
 * Network brief strip — the page's one-line operational briefing, built as a
 * single hairline grid (gap-px on the line color) instead of four floating
 * cards. Facts live once: occupancy and facility states are the hero's, the
 * per-essential breakdown is Readiness's headline detail below — this strip
 * carries only the network-level counts: facilities, staff, essentials
 * covered, and the 24-hour flow (in/out) with signs spelled out in words.
 */
const BriefStrip = ({ summary }) => {
  if (!summary) {
    return (
      <div
        className="grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-line min-[560px]:grid-cols-2 xl:grid-cols-4"
        role="status"
        aria-label="Loading network brief"
      >
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className="bg-surface px-3.5 py-3">
            <SkeletonStatCard />
          </div>
        ))}
      </div>
    );
  }

  const essentials = ["electricity", "water", "comfortRoom"]
    .map((key) => summary.resources?.[key])
    .filter(Boolean);
  const essentialsHave = essentials.reduce((sum, row) => sum + row.have, 0);
  const essentialsTotal = essentials.reduce((sum, row) => sum + row.total, 0);

  const cells = [
    {
      icon: <Building2 size={15} strokeWidth={1.9} />,
      tone: "primary",
      label: "Facilities",
      value: summary.facilities.total,
      caption: `${summary.facilities.deleted} deleted · registered centers`,
    },
    {
      icon: <UserCheck size={15} strokeWidth={1.9} />,
      tone: "primary",
      label: "Staff accounts",
      value: summary.staff.total,
      caption: `${summary.staff.active} active · ${summary.staff.disabled} disabled`,
    },
    {
      icon: <ShieldCheck size={15} strokeWidth={1.9} />,
      tone: "primary",
      label: "Essentials covered",
      value: essentialsTotal > 0 ? `${essentialsHave}/${essentialsTotal}` : "—",
      caption: "facility essentials available",
    },
    {
      icon: <ArrowLeftRight size={15} strokeWidth={1.9} />,
      tone: "primary",
      label: "24h flow",
      value: `+${summary.activity.last24h.checkIns} / −${summary.activity.last24h.checkOuts}`,
      caption: "check-ins / check-outs",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-line min-[560px]:grid-cols-2 xl:grid-cols-4">
      {cells.map((cell) => (
        <div key={cell.label} className="flex items-start gap-3 bg-surface px-3.5 py-3">
          <span
            aria-hidden="true"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${ICON_TONES[cell.tone]}`}
          >
            {cell.icon}
          </span>
          <div className="min-w-0">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.8px] text-muted">
              {cell.label}
            </p>
            <p className="mt-1 text-[19px] font-bold leading-none text-ink">
              {typeof cell.value === "number" ? (
                <RollingNumber value={cell.value} />
              ) : (
                cell.value
              )}
            </p>
            <p className="mt-1 text-[10px] text-muted">{cell.caption}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BriefStrip;
