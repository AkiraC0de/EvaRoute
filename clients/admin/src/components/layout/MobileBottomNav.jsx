import { NavLink } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { NAV_ITEMS } from "../../app/navigation";
import { useAuth } from "../../context/AuthContext";

/**
 * Mobile bottom navigation (hidden on sm+ where the sidebar rail takes over).
 *
 * An edge-to-edge bar stuck to the bottom, left and right of the viewport
 * (flush — no floating pill, no margins, no drop shadow; a hairline top
 * border separates it from content) — the same navigation chrome as the
 * desktop rail — built from the same NAV_ITEMS model
 * (role-filtered) so destinations and permissions can never diverge. The
 * active destination is a translucent white slab that SLIDES between items
 * (motion `layoutId`) when the user taps a different destination.
 *
 * The bar's bottom padding includes env(safe-area-inset-bottom) so it clears
 * the home indicator; AppShell reserves matching space so content is never
 * covered. `end` comes from the nav model (My Facility) so nested routes
 * highlight their parent destination correctly.
 */
const MobileBottomNav = () => {
  const { user } = useAuth();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));
  const reduceMotion = useReducedMotion();
  const highlightTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 480, damping: 40, mass: 0.85 };

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 sm:hidden"
    >
      <ul className="flex w-full items-stretch gap-1 border-t border-line bg-surface px-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-1.5">
        {items.map(({ label, shortLabel, to, end, icon: Icon }) => (
          <li key={to} className="min-w-0 flex-1">
            <NavLink
              to={to}
              end={end}
              aria-label={label}
              className={({ isActive }) =>
                `relative flex min-h-11 w-full flex-col items-center justify-center gap-1 rounded-md px-0.5 py-1.5 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink ${
                  isActive ? "text-primary-strong" : "text-muted-dim hover:text-muted"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="mobile-nav-highlight"
                      initial={false}
                      aria-hidden="true"
                      className="absolute inset-0 rounded-md bg-primary-soft"
                      transition={highlightTransition}
                    />
                  )}
                  {Icon && (
                    <Icon
                      size={18}
                      strokeWidth={1.9}
                      aria-hidden="true"
                      className="relative z-10 shrink-0"
                    />
                  )}
                  <span className="relative z-10 max-w-full truncate text-[11px] font-semibold leading-none max-[400px]:text-[10px]">
                    {shortLabel ?? label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
