import { motion } from 'motion/react';
import { motionTokens } from '../../lib/motion';

const maneuverIconPaths = {
  right: 'M5 12h14m0 0l-5-5m5 5l-5 5',
  left: 'M19 12H5m0 0l5-5m-5 5l5 5',
  u_turn: 'M6 12h12M8 6l8 6-8 6',
  straight: 'M5 12h14',
  turn_right: 'M5 12h14m0 0l-5-5m5 5l-5 5',
  turn_left: 'M19 12H5m0 0l5-5m-5 5l5 5',
  uturn_left: 'M6 12h12M8 6l8 6-8 6',
  uturn_right: 'M6 12h12M8 6l8 6-8 6',
  continue: 'M5 12h14',
};

function defaultIconPath() {
  return 'M5 12h14m0 0l-5-5m5 5l-5 5';
}

/** Per-step distance in meters → "350 m" / "1.2 km". */
function formatStepDistance(meters) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

/**
 * TurnInstruction — the floating "Next ‹instruction›" card.
 *
 * `distance` is the step's OWN length in meters (GraphHopper
 * instruction.distance, via routing.js) — the distance the instruction
 * covers, not the remaining distance to the destination.
 */
export default function TurnInstruction({ instruction, maneuverType, distance }) {
  const key = maneuverType ? maneuverType.toLowerCase().replace(/[\s-]+/g, '_') : '';
  const pathD = maneuverIconPaths[key] ?? defaultIconPath();

  return (
    <motion.div
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
      className="pointer-events-none fixed left-1/2 top-3 z-40 flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-1.5 whitespace-normal rounded-full bg-surface py-2 pl-3 pr-4 leading-[1.35] text-ink shadow-floating md:top-6"
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-dim" aria-hidden="true">
        Next
      </span>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent" aria-hidden="true">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d={pathD} />
        </svg>
      </span>
      <span className="text-[15px] font-semibold text-ink" aria-live="polite">
        {instruction}
      </span>
      {distance != null && distance > 0 && (
        <span className="ml-0.5 text-[13px] text-muted">for {formatStepDistance(distance)}</span>
      )}
    </motion.div>
  );
}
