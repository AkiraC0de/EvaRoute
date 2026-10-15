import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ActivityIcon from "./ActivityIcon";
import { describeActivity, formatActivityTime } from "./activityText";

/**
 * Defense in depth: the server never logs secrets, but if one ever slipped
 * into metadata its value must not render in the UI. Keys that look
 * sensitive are masked in the Details expander.
 */
const SENSITIVE_KEY = /password|token|secret|otp|credential|authorization/i;

function redact(value, keyHint = "") {
  if (Array.isArray(value)) return value.map((item) => redact(item, keyHint));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) =>
        SENSITIVE_KEY.test(k) ? [k, "••••••"] : [k, redact(v, k)],
      ),
    );
  }
  return SENSITIVE_KEY.test(keyHint) ? "••••••" : value;
}

/**
 * One activity entry: icon chip + sentence + time + optional facility chip +
 * expandable before/after metadata.
 */
export default function ActivityRow({ log, showFacility = false }) {
  const md = log.metadata ?? null;
  const hasDetails = md && Object.keys(md).length > 0;
  const [open, setOpen] = useState(false);

  return (
    <li className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-sunken/40">
      <ActivityIcon log={log} />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink">{describeActivity(log)}</p>
        <div className="mt-1 flex items-center gap-x-2 text-xs text-ink-muted">
          <span className="shrink-0">{formatActivityTime(log.createdAt)}</span>
          {showFacility && log.facilityName && (
            <span className="rounded-full bg-sunken/70 px-2 py-0.5 text-[10px] text-muted">
              {log.facilityName}
            </span>
          )}
          {showFacility && !log.facilityName && (
            <span className="rounded-full bg-sunken/70 px-2 py-0.5 text-[10px] text-muted">
              Network
            </span>
          )}
          {hasDetails && (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              className="ml-auto inline-flex shrink-0 items-center gap-1 text-xs text-ink-muted transition-colors hover:text-accent"
            >
              Details
              <ChevronDown
                size={12}
                className={`transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
        {open && hasDetails && (
          <pre className="mt-2 max-w-full overflow-x-auto rounded-2xl bg-sunken px-3 py-2 text-[11px] text-ink-muted">
            {JSON.stringify(redact(md), null, 2)}
          </pre>
        )}
      </div>
    </li>
  );
}
