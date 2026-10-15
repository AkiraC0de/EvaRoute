import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../../app/navigation";
import { useAuth } from "../../context/AuthContext";

/**
 * Mobile bottom navigation (hidden on sm+ where the sidebar rail takes over).
 *
 * A floating clay card pinned near the bottom of the viewport, built from the
 * same NAV_ITEMS model as the sidebar (role-filtered) so destinations and
 * permissions can never diverge. Design follows the reference's "tinted
 * pill + raised chip" pattern adapted to clay: the active destination is a
 * raised accent chip, inactive destinations stay quiet and press to an inset.
 *
 * The bar's bottom padding includes env(safe-area-inset-bottom) so it clears
 * the home indicator; AppShell reserves matching space so content is never
 * covered. `end` comes from the nav model (My Facility) so nested routes
 * highlight their parent destination correctly.
 */
const MobileBottomNav = () => {
  const { user } = useAuth();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-1.5 sm:hidden"
    >
      <ul className="mx-auto flex w-full max-w-[480px] items-stretch gap-1 rounded-clay bg-surface p-1.5 shadow-clay">
        {items.map(({ label, shortLabel, to, end, icon: Icon }) => (
          <li key={to} className="min-w-0 flex-1">
            <NavLink
              to={to}
              end={end}
              aria-label={label}
              className={({ isActive }) =>
                `flex min-h-11 w-full flex-col items-center justify-center gap-1 rounded-clay-sm px-1 py-1.5 transition active:shadow-clay-inset ${
                  isActive
                    ? "bg-accent-soft text-accent-strong shadow-clay-xs"
                    : "text-[#96a2bb] hover:text-[#687594]"
                }`
              }
            >
              {Icon && (
                <Icon size={18} strokeWidth={1.9} aria-hidden="true" className="shrink-0" />
              )}
              <span className="max-w-full truncate text-[8px] font-semibold leading-none">
                {shortLabel ?? label}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
