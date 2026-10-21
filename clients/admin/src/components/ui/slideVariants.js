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

/**
 * Paper-wipe hero reveal: the hero's color layer starts as a degenerate
 * polygon pinned to the top-left corner and sweeps to full coverage with a
 * diagonal leading edge — the color "gets on" the card from top-left to
 * bottom-right over a neutral base. Content fades up slightly behind the
 * sweep so white type never sits on the uncolored base. Reduced motion =
 * straight to the final state. Spread each object onto a motion element:
 *   <motion.div aria-hidden {...paperWipe(reduce).overlay} className=… />
 *   <motion.div {...paperWipe(reduce).content}>…</motion.div>
 */
export const paperWipe = (reduceMotion) => ({
  overlay: {
    initial: {
      clipPath: reduceMotion
        ? "polygon(0% 0%, 200% 0%, 100% 100%, -100% 100%)"
        : "polygon(0% 0%, 0% 0%, -100% 100%, -100% 100%)",
    },
    animate: { clipPath: "polygon(0% 0%, 200% 0%, 100% 100%, -100% 100%)" },
    transition: { duration: reduceMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] },
  },
  content: {
    initial: reduceMotion ? false : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduceMotion ? 0 : 0.5,
      ease: [0.22, 1, 0.36, 1],
      delay: reduceMotion ? 0 : 0.25,
    },
  },
});
