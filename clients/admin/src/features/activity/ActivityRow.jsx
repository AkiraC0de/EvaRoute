import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ActivityIcon from "./ActivityIcon";
import ActivityDetails from "./ActivityDetails";
import { describeActivity, formatActivityTime } from "./activityText";

/**
 * One activity entry in the dense list-row language: tinted icon chip,
 * sentence, compact meta line (time + facility tag), and a right-aligned
 * details toggle opening a bordered inset metadata panel (bg-surface-2 +
 * hairline, never a molded inset).
 */
export default function ActivityRow({ log, showFacility = false }) {
  const md = log.metadata ?? null;
  const hasDetails = md && Object.keys(md).length > 0;
  const [open, setOpen] = useState(false);

  return (
    <li className="flex items-start gap-2.5 border-b border-line px-4 py-2.5 transition-colors hover:bg-surface-2">
      <ActivityIcon log={log} className="h-7 w-7" />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold leading-snug text-ink-soft">{describeActivity(log)}</p>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
          <span className="shrink-0">{formatActivityTime(log.createdAt)}</span>
          {showFacility && (
            <span className="shrink-0 rounded-full bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted">
              {log.facilityName || "Network"}
            </span>
          )}
          {hasDetails && (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              className="ml-auto inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-primary-ink transition-colors hover:text-primary-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
            >
              Details
              <ChevronDown
                size={11}
                className={`transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
        {open && hasDetails && <ActivityDetails metadata={md} />}
      </div>
    </li>
  );
}
