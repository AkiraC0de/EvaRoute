import { NavLink } from "react-router-dom";
import { NAV_SECTIONS } from "../../app/navigation";
import { useAuth } from "../../context/AuthContext";

/**
 * Sidebar rail navigation (sm+ only — on mobile the destinations live in
 * MobileBottomNav), driven entirely by app/navigation.js and filtered by the
 * signed-in user's role. Adding a screen or restricting one to a role is a
 * config change, not a component change.
 *
 * The Account section is intentionally not rendered here: Profile opens from
 * the user card on desktop and from the mobile bottom bar, so the desktop
 * rail stays a clean destinations list.
 *
 * Modern rail treatment on the white sidebar: icon + label rows, an active
 * state as a soft accent pill with a slim accent indicator bar, quiet hover
 * on inactive rows.
 */
const ITEM =
  "group relative mb-1 flex w-full items-center gap-2.5 rounded-clay-sm px-3 py-2.5 text-left transition";
const SECTION_LABEL =
  "mb-2 ml-2 text-[8px] font-semibold uppercase tracking-[1.5px] text-muted-dim";

const itemClasses = ({ isActive }) =>
  isActive
    ? "bg-accent-soft"
    : "hover:bg-sunken";

const labelClasses = ({ isActive }) =>
  `text-[11px] ${
    isActive ? "font-semibold text-accent-strong" : "font-medium text-[#687594]"
  }`;

const iconClasses = ({ isActive }) =>
  isActive ? "text-accent" : "text-[#96a2bb] group-hover:text-[#687594]";

const SidebarNav = () => {
  const { user } = useAuth();

  return (
    <nav
      aria-label="Staff navigation"
      className="hidden flex-1 px-3 sm:block"
    >
      {NAV_SECTIONS.map((section) => {
        if (section.id === "account") return null;

        const items = section.items.filter((item) => item.roles.includes(user?.role));
        if (items.length === 0) return null;

        return (
          <div key={section.id}>
            <p className={SECTION_LABEL}>{section.label}</p>
            {items.map(({ label, to, end, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `${ITEM} ${itemClasses({ isActive })}`}
              >
                {({ isActive }) => (
                  <>
                    {Icon && (
                      <Icon
                        size={15}
                        strokeWidth={1.9}
                        aria-hidden="true"
                        className={`shrink-0 transition-colors ${iconClasses({ isActive })}`}
                      />
                    )}
                    <span className={labelClasses({ isActive })}>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        );
      })}
    </nav>
  );
};

export default SidebarNav;
