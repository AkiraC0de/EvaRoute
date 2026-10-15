import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Sidebar from "./Sidebar";

/**
 * Authenticated application shell: shared sidebar + content area on the clay
 * canvas. Route changes play a short fade/slide which is disabled when the
 * user prefers reduced motion.
 */
const AppShell = () => {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
      <main className="ml-49.5 min-h-screen bg-canvas p-6 max-sm:ml-0 max-sm:p-4">
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
    </div>
  );
};

export default AppShell;
