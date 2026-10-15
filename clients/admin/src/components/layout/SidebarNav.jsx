import { NavLink } from "react-router-dom";
import { NAV_SECTIONS } from "../../app/navigation";
import { useAuth } from "../../context/AuthContext";

/**
 * Sidebar navigation, driven entirely by app/navigation.js and filtered by the
 * signed-in user's role. Adding a screen or restricting one to a role is a
 * config change, not a component change.
 *
 * Modern rail treatment on the white sidebar: icon + label rows, an active
 * state as a soft accent pill with a slim accent indicator bar, quiet hover
 * on inactive rows.
 */
const ITEM =
  "group relative mb-1 flex w-full items-center gap-2.5 rounded-clay-sm px-3 py-2.5 text-left transition max-sm:w-auto";
const ACCOUNT_ITEM =
  "group relative hidden w-full items-center gap-2.5 rounded-clay-sm px-3 py-2.5 text-left transition max-sm:flex max-sm:w-auto";
const SECTION_LABEL =
  "mb-2 ml-2 text-[8px] font-semibold uppercase tracking-[1.5px] text-muted-dim max-sm:hidden";

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
      className="flex-1 px-3 max-sm:flex max-sm:flex-wrap max-sm:gap-1 max-sm:pb-3"
    >
      {NAV_SECTIONS.map((section) => {
        const items = section.items.filter((item) => item.roles.includes(user?.role));
        if (items.length === 0) return null;

        const isAccount = section.id === "account";

        return (
          <div key={section.id}>
            {/* The Account section's only item is mobile-only (desktop opens
                Profile via the user card), so its label would be a dead group
                header on desktop — render it only where the items show. */}
            {!isAccount && (
              <p className={SECTION_LABEL}>{section.label}</p>
            )}
            {items.map(({ label, to, end, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `${isAccount ? ACCOUNT_ITEM : ITEM} ${itemClasses({ isActive })}`
                }
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
