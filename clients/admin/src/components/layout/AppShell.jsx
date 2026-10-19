import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import MobileBottomNav from "./MobileBottomNav";
import Sidebar from "./Sidebar";

/**
 * Authenticated application shell: shared sidebar + content area on the clay
 * canvas. Page content is capped at 1280px and centered inside the content
 * area so pages never stretch on wide screens (the canvas still spans the
 * full width). On mobile the navigation moves to a floating bottom bar
 * (MobileBottomNav) and the content reserves bottom space so the bar never
 * covers it. Route changes play a short fade/slide which is disabled when the
 * user prefers reduced motion.
 */
const AppShell = () => {
  const location = useLocation()
  // Why useOutlet() instead of <Outlet />: AnimatePresence keeps the exiting
  // wrapper mounted while it animates out, but a live <Outlet /> reads router
  // context and re-renders the INCOMING page inside that exiting wrapper —
  // the exit appears to never play and the enter appears to run twice.
  // Capturing the outlet element freezes the old page for the exit.
  const outlet = useOutlet();
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
      <main className="ml-49.5 min-h-screen bg-canvas p-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-6 max-sm:ml-0 max-sm:px-4 max-sm:pt-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            className="mx-auto w-full max-w-[1280px]"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: "easeOut" }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default AppShell;
