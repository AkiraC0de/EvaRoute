import { Suspense } from "react";
import { SkeletonPage } from "../ui/Skeleton";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import MobileBottomNav from "./MobileBottomNav";
import Sidebar from "./Sidebar";

/**
 * Authenticated application shell: shared sidebar + content area on the
 * warm-neutral canvas. Page content is capped at 1280px and centered inside the content
 * area so pages never stretch on wide screens (the canvas still spans the
 * full width). On mobile the navigation moves to a floating bottom bar
 * (MobileBottomNav) and the content reserves bottom space so the bar never
 * covers it. Route changes play a short fade/slide which is disabled when the
 * user prefers reduced motion.
 */
const AppShell = () => {
  const location = useLocation()
  const outlet = useOutlet();
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
      <main className="ml-49.5 min-h-screen bg-canvas p-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-6 max-sm:ml-0 max-sm:px-4 max-sm:pt-4">
        {/* Entrance choreography: content renders only after the sidebar has
            landed (mounts once with the shell — route changes use the keyed
            transition below). */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut", delay: reduceMotion ? 0 : 0.5 }}
        >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            className="mx-auto w-full max-w-[1280px]"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: "easeOut" }}
          >
            <Suspense fallback={<SkeletonPage />}>
              {outlet}
            </Suspense>
          </motion.div>
        </AnimatePresence>
        </motion.div>
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default AppShell;
