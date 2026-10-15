import { NavLink } from "react-router-dom";
import { NAV_SECTIONS } from "../../app/navigation";
import { useAuth } from "../../context/AuthContext";

/**
 * Sidebar navigation, driven entirely by app/navigation.js and filtered by the
 * signed-in user's role. Adding a screen or restricting one to a role is a
 * config change, not a component change.
 *
 * Class strings are kept identical to the original sidebar: the Account
 * section's links show on mobile only (the desktop entry point is the user
 * card in SidebarUserCard), and the Account label carries the extra top
 * margin the original had.
 */
const MANAGE_ITEM =
  "mb-1 flex w-full items-center rounded-xl px-3 py-2.5 text-left transition max-sm:w-auto";
const ACCOUNT_ITEM =
  "hidden w-full items-center rounded-xl px-3 py-2.5 text-left transition max-sm:flex max-sm:w-auto";
const SECTION_LABEL =
  "mb-3 ml-2 text-[8px] font-semibold uppercase tracking-[1.5px] text-[#a2acc0] max-sm:hidden";

const labelClasses = ({ isActive }) =>
  `text-[11px] ${
    isActive ? "font-semibold text-[#3554d1]" : "font-medium text-[#687594]"
  }`;

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
            <p className={`${SECTION_LABEL} ${isAccount ? "mt-4" : ""}`}>
              {section.label}
            </p>
            {items.map(({ label, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `${isAccount ? ACCOUNT_ITEM : MANAGE_ITEM} ${
                    isActive ? "bg-white shadow-[0_4px_12px_rgba(50,70,120,0.08)]" : "hover:bg-white"
                  }`
                }
              >
                {({ isActive }) => <span className={labelClasses({ isActive })}>{label}</span>}
              </NavLink>
            ))}
          </div>
        );
      })}
    </nav>
  );
};

export default SidebarNav;
