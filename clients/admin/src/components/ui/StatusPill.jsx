import { statusMetaOf } from "./statusMeta";

/**
 * Status pill for RECORDS (facility status, account state): `status` picks
 * the canonical label + tone from statusMeta.js — the ONE taxonomy. `tone`
 * + children remains for non-status chips (roles, capacity notes).
 * Semantic colors mean status; category decoration never uses them.
 */
const TONES = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger-strong",
  primary: "bg-primary-soft text-primary",
  neutral: "bg-surface-2 text-muted",
};

const StatusPill = ({ status, tone = "neutral", children }) => {
  const meta = status ? statusMetaOf(status) : null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${TONES[meta ? meta.tone : tone] ?? TONES.neutral}`}
    >
      {meta ? meta.label : children}
    </span>
  );
};

export default StatusPill;
