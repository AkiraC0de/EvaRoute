import { motion, useReducedMotion } from "motion/react";

/**
 * Message banner used for errors, warnings, info and success notices.
 *
 * Centralises the tone palette + accessibility role so every screen surfaces
 * feedback identically. Info speaks in the operations teal; semantic tones
 * mean STATUS. Callers pass their own sizing classes to preserve their exact
 * look; the default matches the most common variant.
 */
const TONES = {
  error: { wrap: "border border-danger/15 bg-danger-soft font-semibold text-danger", role: "alert" },
  warning: { wrap: "border border-warning/15 bg-warning-soft font-medium text-warning", role: "status" },
  info: { wrap: "border border-secondary/15 bg-secondary-soft font-medium text-secondary-ink", role: "status" },
  success: { wrap: "border border-success/15 bg-success-soft font-medium text-success", role: "status" },
};

const Banner = ({ tone = "info", className = "px-3 py-2 text-[12px]", children }) => {
  const palette = TONES[tone] ?? TONES.info;
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      role={palette.role}
      initial={reduceMotion ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-md ${palette.wrap} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Banner;
