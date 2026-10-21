import { motion, useReducedMotion } from "motion/react";
import SectionCard from "./SectionCard";

/**
 * Readiness — the mandatory-essentials picture as radial gauges (the shadcn
 * `radial-progress` idiom) instead of meter rows: one ring per essential,
 * the coverage count and percent in the hub, the label and missing-count
 * under each. Same facts as always (have/total per essential) — only the
 * presentation changed. Rings draw in on mount and are instant under
 * reduced motion; state reads from the caption text too, never color alone.
 */

const RING_SIZE = 92;
const RING_STROKE = 9;
const RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const Gauge = ({ label, have, total, missing }) => {
  const reduceMotion = useReducedMotion();
  const pct = total > 0 ? (have / total) * 100 : 0;
  const stroke =
    missing > 0 ? "var(--color-secondary)" : "var(--color-success)";

  return (
    <div className="flex flex-1 flex-col items-center gap-1.5">
      <div
        role="img"
        aria-label={`${label}: ${have} of ${total} facilities`}
        className="relative"
        style={{ width: RING_SIZE, height: RING_SIZE }}
      >
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          className="-rotate-90"
        >
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-surface-2)"
            strokeWidth={RING_STROKE}
          />
          <motion.circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={stroke}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={
              reduceMotion
                ? false
                : { strokeDashoffset: CIRCUMFERENCE }
            }
            animate={{
              strokeDashoffset: CIRCUMFERENCE * (1 - pct / 100),
            }}
            transition={{
              duration: reduceMotion ? 0 : 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[15px] font-bold leading-none text-ink">
            {have}/{total}
          </span>
          <span className="mt-1 text-[9px] font-semibold text-muted-dim">
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      <p className="text-center text-[10px] font-semibold text-ink-soft">
        {label}
      </p>
      <p className="text-[9px] text-muted">
        {missing > 0 ? `${missing} missing` : "full coverage"}
      </p>
    </div>
  );
};

const ReadinessRadialCard = ({ summary }) => {
  if (!summary) {
    return (
      <SectionCard title="Readiness" meta="Mandatory essentials per facility.">
        <div className="flex items-start justify-between gap-2">
          {[0, 1, 2].map((n) => (
            <div key={n} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="h-[92px] w-[92px] rounded-full bg-surface-2" />
              <div className="h-2.5 w-16 rounded-full bg-surface-2" />
              <div className="h-2 w-12 rounded-full bg-surface-2" />
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }

  const rows = ["electricity", "water", "comfortRoom"]
    .map((key) => summary.resources?.[key])
    .filter(Boolean);

  return (
    <SectionCard title="Readiness" meta="Mandatory essentials per facility.">
      <div className="flex items-start justify-between gap-2">
        {rows.map((row) => (
          <Gauge
            key={row.label}
            label={row.label}
            have={row.have}
            total={row.total}
            missing={row.total - row.have}
          />
        ))}
      </div>
    </SectionCard>
  );
};

export default ReadinessRadialCard;
