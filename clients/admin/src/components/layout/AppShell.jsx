import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import MobileBottomNav from "./MobileBottomNav";
import Sidebar from "./Sidebar";

/**
 * Authenticated application shell: shared sidebar + content area on the clay
 * canvas. On mobile the navigation moves to a floating bottom bar
 * (MobileBottomNav) and the content reserves bottom space so the bar never
 * covers it. Route changes play a short fade/slide which is disabled when the
 * user prefers reduced motion.
 */
const AppShell = () => {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
      <main className="ml-49.5 min-h-screen bg-canvas p-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-6 max-sm:ml-0 max-sm:px-4 max-sm:pt-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default AppShell;
