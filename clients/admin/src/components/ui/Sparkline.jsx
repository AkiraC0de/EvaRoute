import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Decorative mini trend line for metric tiles: a smooth curve with a fading
 * trail (leading portion in the primary color, tail fading to the line
 * gray) — no axes, no dots, no grid. Purely indicative: the number and the
 * delta chip carry the actual information, and the series is aria-hidden.
 * Draws in once on mount (pathLength); instant under reduced motion.
 */
const PAD = 3;

const buildPath = (values, width, height) => {
  const max = Math.max(...values, 1);
  const stepX =
    values.length > 1 ? (width - PAD * 2) / (values.length - 1) : 0;
  const points = values.map((v, i) => [
    PAD + i * stepX,
    height - PAD - (v / max) * (height - PAD * 2),
  ]);
  let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  for (let i = 1; i < points.length; i += 1) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx.toFixed(1)} ${y0.toFixed(1)}, ${cx.toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return d;
};

const Sparkline = ({ values = [], width = 76, height = 30, className = "" }) => {
  const reduceMotion = useReducedMotion();
  const gradientId = `spark-fade-${useId()}`;

  if (values.length < 2) return null;

  return (
    <svg
      aria-hidden="true"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`shrink-0 overflow-visible ${className}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="55%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-line-strong)" />
        </linearGradient>
      </defs>
      <motion.path
        d={buildPath(values, width, height)}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        stroke={`url(#${gradientId})`}
        initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
};

export default Sparkline;
