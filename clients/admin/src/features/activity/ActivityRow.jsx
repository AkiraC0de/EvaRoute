import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ActivityIcon from "./ActivityIcon";
import ActivityDetails from "./ActivityDetails";
import { describeActivity, formatActivityTime } from "./activityText";

/**
 * One activity entry in the app's dense list-row language: tinted icon chip,
 * sentence, compact meta line (time + facility tag), and a right-aligned
 * details toggle opening an inset metadata panel.
 */
export default function ActivityRow({ log, showFacility = false }) {
  const md = log.metadata ?? null;
  const hasDetails = md && Object.keys(md).length > 0;
  const [open, setOpen] = useState(false);

  return (
    <li className="flex items-start gap-2.5 px-4 py-2.5 transition-colors border-b border-gray-200 hover:bg-sunken">
      <ActivityIcon log={log} className="h-7 w-7" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold leading-snug text-ink-soft">{describeActivity(log)}</p>
        <div className="mt-0.5 flex items-center gap-2 text-[9px] text-muted">
          <span className="shrink-0">{formatActivityTime(log.createdAt)}</span>
          {showFacility && (
            <span className="shrink-0 rounded-full bg-sunken px-1.5 py-0.5 text-[9px] text-muted">
              {log.facilityName || "Network"}
            </span>
          )}
          {hasDetails && (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              className="ml-auto inline-flex shrink-0 items-center gap-1 text-[9px] font-semibold text-accent transition-colors hover:text-accent-strong"
            >
              Details
              <ChevronDown
                size={11}
                className={`transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
        {open && hasDetails && <ActivityDetails metadata={md} />}
      </div>
    </li>
  );
}
