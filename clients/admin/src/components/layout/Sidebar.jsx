import { motion, useReducedMotion } from "motion/react";
import MobileAccountChip from "./MobileAccountChip";
import SidebarNav from "./SidebarNav";
import SidebarUserCard from "./SidebarUserCard";

/**
 * Authenticated application sidebar — a clean white rail with a hairline
 * separation from the canvas. Brand header on top, role-filtered navigation
 * in the middle, the account card pinned at the bottom. (The EvaRoute logo
 * is light-background artwork, so it sits in its own bordered tile.) On
 * mobile the rail flattens into the top header bar — brand at the left,
 * the account card becomes the MobileAccountChip at the right.
 */
const Sidebar = () => {
  const reduceMotion = useReducedMotion();

  return (
  <motion.aside
    initial={reduceMotion ? false : { x: "-100%" }}
    animate={{ x: 0 }}
    transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1], delay: reduceMotion ? 0 : 0.15 }}
    className="fixed left-0 top-0 z-50 flex h-screen w-49.5 flex-col border-b border-line bg-surface sm:border-b-0 sm:border-r max-sm:relative max-sm:h-auto max-sm:w-full"
  >
    <div className="flex h-23 items-center gap-3 px-5 max-sm:h-18">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface">
          <img src="./evaRouteLogo.png" alt="EvaRoute logo" className="h-full w-full object-contain" />
        </div>
        <div>
          <p className="text-[16px] font-bold text-ink">EvaRoute</p>
          <p className="text-[10px] font-medium tracking-[1px] text-muted">
            STAFF PORTAL
          </p>
        </div>
      </div>
      {/* Mobile only: the account chip closes the header row at the right —
          the Profile / Log out entry point now that the bottom bar
          dropped its Profile destination. */}
      <MobileAccountChip />
    </div>

    <SidebarNav />
    <SidebarUserCard />
  </motion.aside>
  );
};

export default Sidebar;
