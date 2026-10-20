/**
 * Motion vocabulary for the auth screens (brand panel, sign-in, reset flow).
 * One shared set of variants so the page entrance, the reset steps and the
 * login <-> reset switch all speak the same language.
 *
 * Style: restrained flat motion — soft ease-out, short distances, quick
 * exits. Every variant set degrades to a fade under prefers-reduced-motion.
 */

const EASE = [0.22, 0.61, 0.36, 1];

export const authVariants = (reduce) => {
  if (reduce) {
    const instant = {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0.15 } },
      exit: { opacity: 0, transition: { duration: 0.1 } },
    };
    return {
      stagger: { hidden: {}, show: {}, exit: {} },
      fadeUp: instant,
      fadeIn: instant,
      panel: () => instant,
    };
  }

  return {
    /** Container: cascades its fadeUp children. */
    stagger: {
      hidden: {},
      show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
      exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
    },
    /** Standard element entrance. */
    fadeUp: {
      hidden: { opacity: 0, y: 14 },
      show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
      exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
    },
    /** Quiet entrance for large decorative blocks. */
    fadeIn: {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0.6, ease: EASE } },
      exit: { opacity: 0, transition: { duration: 0.2 } },
    },
    /**
     * Directional slide for view/step switches (AnimatePresence mode="wait").
     * `direction` 1 = moving forward (login -> reset, step -> step), -1 = back.
     */
    panel: (direction = 1) => ({
      hidden: { opacity: 0, x: 20 * direction },
      show: { opacity: 1, x: 0, transition: { duration: 0.32, ease: EASE } },
      exit: { opacity: 0, x: -16 * direction, transition: { duration: 0.2, ease: "easeIn" } },
    }),
  };
};
