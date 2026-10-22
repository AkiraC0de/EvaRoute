import { Activity, Boxes, LogIn, LogOut, Users } from "../../components/icons/evaIcons";
import RollingNumber from "../../components/ui/RollingNumber";

/**
 * Readiness rail — ONE divided instrument panel (a gap-px line grid, not a
 * row of separate cards) presenting the facility's operational facts as a
 * single scannable strip. The hero console owns status, occupancy and
 * essentials readiness; the rail carries what is NOT stated above it:
 *
 *   Resources · Staff · Check-ins today · Check-outs today · 7-day events
 *
 * Every number is real data (resources/roster/hooks props; the activity
 * counts come from the facility-scoped activity stats). Cells whose data is
 * still loading or failed render "—" — a 0 must be a measured zero. Category
 * tints: resources + event total = neutral (records), staff + movement
 * counts = secondary (people).
 */
const INSTRUMENTS = [
  { key: "resources", label: "Resources", caption: "recorded", Icon: Boxes, chip: "bg-surface-2 text-muted" },
  { key: "staff", label: "Staff", caption: "assigned", Icon: Users, chip: "bg-secondary-soft text-secondary-ink" },
  { key: "checkIns", label: "Check-ins", caption: "today", Icon: LogIn, chip: "bg-secondary-soft text-secondary-ink" },
  { key: "checkOuts", label: "Check-outs", caption: "today", Icon: LogOut, chip: "bg-secondary-soft text-secondary-ink" },
  { key: "events", label: "Events", caption: "rolling 7 days", Icon: Activity, chip: "bg-surface-2 text-muted" },
];

const FacilityReadinessRail = ({ resourceCount, staffCount, todayIn, todayOut, weekTotal, states = {} }) => {
  const values = {
    resources: resourceCount,
    staff: staffCount,
    checkIns: todayIn,
    checkOuts: todayOut,
    events: weekTotal,
  };

  return (
    <section aria-label="Facility readiness" className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
      {INSTRUMENTS.map(({ key, label, caption, Icon, chip }) => {
        // Per-cell data state from the page: "ready" (measured), "pending" or
        // "failed". Anything not measured renders "—", never a fake 0.
        const state = states[key] ?? "ready";
        return (
          <div key={key} className="flex items-start gap-2.5 bg-surface p-3.5 last:col-span-2 sm:last:col-span-2 lg:last:col-span-1">
            <span
              aria-hidden="true"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${chip}`}
            >
              <Icon size={15} strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <p className="label-micro text-muted">{label}</p>
              <p className="mt-1 text-[20px] font-bold leading-none text-ink">
                {state === "ready" ? <RollingNumber value={values[key]} /> : "—"}
              </p>
              <p className="mt-1 text-[11px] text-muted">{caption}</p>
              {state === "failed" && (
                <p className="mt-1 text-[11px] text-danger">Couldn't load</p>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default FacilityReadinessRail;
