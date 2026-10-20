/**
 * Shared directional slide variants for list-panel swaps (view toggles,
 * pagination). Non-component module beside the ui primitives (fieldStyles
 * precedent — component files export components only).
 *
 * Pair with <AnimatePresence mode="wait" custom={dir}> … variants for a
 * two-way swap (instant data), or a keyed <motion.div custom={dir}> for an
 * entrance-only slide (content arriving async). `d` is the direction of
 * travel: +1 forward (enters from the right), -1 back (enters from the left).
 * Function variants + the AnimatePresence `custom` prop are what let an
 * EXITING panel use the fresh direction — its own props freeze at unmount.
 * Reduced motion collapses everything to an instant fade.
 */
export const slideVariants = (reduceMotion) => ({
  enter: (d = 1) => (reduceMotion ? { opacity: 0 } : { opacity: 0, x: 26 * d }),
  center: () =>
    reduceMotion
      ? { opacity: 1, transition: { duration: 0 } }
      : {
          opacity: 1,
          x: 0,
          transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
        },
  exit: (d = 1) =>
    reduceMotion
      ? { opacity: 0, transition: { duration: 0 } }
      : {
          opacity: 0,
          x: -26 * d,
          transition: { duration: 0.16, ease: "easeIn" },
        },
});
