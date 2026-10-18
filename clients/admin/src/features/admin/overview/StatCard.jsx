import { CARD, ICON_TONES } from "./overviewStyles";

/** KPI card — label, primary number, support caption, optional meter. */
const StatCard = ({ icon, tone = "accent", label, value, caption, meter }) => (
  <div className={`${CARD} transition hover:-translate-y-0.5 hover:shadow-clay-lg`}>
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-muted">
          {label}
        </p>
        <p className="mt-1 text-[24px] font-bold leading-none text-ink">{value}</p>
        {caption && <p className="mt-1.5 text-[11px] text-muted">{caption}</p>}
      </div>
      {icon && (
        <span
          aria-hidden="true"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-clay-sm ${ICON_TONES[tone]}`}
        >
          {icon}
        </span>
      )}
    </div>
    {/* Number.isFinite: `0 && …` would render a literal "0" (React falsy footgun). */}
    {Number.isFinite(meter) && (
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-sunken shadow-clay-inset">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-strong transition-[width] duration-500"
          style={{ width: `${Math.min(Math.max(meter, 0), 100)}%` }}
        />
      </div>
    )}
  </div>
);

export default StatCard;
