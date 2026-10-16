/**
 * Motion system — shared tokens and variants (motion-ui skill).
 *
 * Rules of the system:
 *   - transform/opacity only (never width/height/top/left)
 *   - motion must guide attention, communicate state, or preserve spatial
 *     continuity — otherwise it doesn't ship
 *   - stagger stays ≤ 0.1s; screens swap with AnimatePresence mode="wait"
 *   - reduced motion is honoured globally via MotionConfig in main.jsx
 */

export const motionTokens = {
  duration: {
    fast: 0.18,
    normal: 0.35,
    slow: 0.6,
  },
  easing: {
    smooth: [0.22, 1, 0.36, 1],
    sharp: [0.4, 0, 0.2, 1],
  },
  distance: {
    sm: 8,
    md: 16,
    lg: 24,
  },
};

const { duration, easing, distance } = motionTokens;

/** Standard entrance/exit for a screen or panel element. */
export const fadeUp = {
  initial: { opacity: 0, y: distance.md },
  animate: { opacity: 1, y: 0, transition: { duration: duration.normal, ease: easing.smooth } },
  exit: { opacity: 0, y: distance.sm, transition: { duration: duration.fast, ease: easing.sharp } },
};

/** Mobile bottom sheet: rises from below. */
export const slideUp = {
  initial: { opacity: 0, y: distance.lg * 2 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.normal, ease: easing.smooth } },
  exit: { opacity: 0, y: distance.lg * 2, transition: { duration: duration.fast, ease: easing.sharp } },
};

/** Desktop floating panel: arrives from the right edge it docks to. */
export const slideRight = {
  initial: { opacity: 0, x: distance.lg },
  animate: { opacity: 1, x: 0, transition: { duration: duration.normal, ease: easing.smooth } },
  exit: { opacity: 0, x: distance.lg, transition: { duration: duration.fast, ease: easing.sharp } },
};

/** Compact card (route preview, arrival dialog). */
export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: duration.normal, ease: easing.smooth } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: duration.fast, ease: easing.sharp } },
};

/** List container: staggerChildren stays under the 0.1s cap. */
export const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05 } },
};

/** List item. */
export const staggerItem = {
  initial: { opacity: 0, y: distance.sm },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: easing.smooth },
  },
};

/** Micro-interaction: press feedback for any tappable control. */
export const tapPress = {
  whileHover: { y: -1 },
  whileTap: { scale: 0.97 },
  transition: { duration: duration.fast, ease: easing.sharp },
};
