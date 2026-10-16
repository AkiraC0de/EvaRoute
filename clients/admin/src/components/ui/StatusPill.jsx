/**
 * Status pill for records (facility status, account active state).
 * `tone` maps to the feedback palette.
 */
const TONES = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  accent: "bg-accent-soft text-accent",
  neutral: "bg-sunken text-muted",
};

const StatusPill = ({ tone = "neutral", children }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-clay-inset ${TONES[tone] ?? TONES.neutral}`}
  >
    {children}
  </span>
);

export default StatusPill;
