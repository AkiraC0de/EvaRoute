import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { displayNameOf, initialsOf, roleLabelOf } from "../../lib/user";

/**
 * Signed-in user card at the bottom of the sidebar. Acts as the desktop
 * entry point to the Profile screen (on mobile the Profile nav link shows
 * instead — see SidebarNav).
 */
const SidebarUserCard = () => {
  const { user } = useAuth();

  return (
    <div className="p-3 max-sm:hidden">
      <NavLink
        to="/profile"
        aria-label={`View profile for ${displayNameOf(user)}`}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl border px-3 py-2 ${
            isActive
              ? "border-[#b7c2ff] bg-white shadow-[0_4px_12px_rgba(50,70,120,0.08)]"
              : "border-transparent bg-white shadow-[0_4px_12px_rgba(50,70,120,0.08)] hover:border-[#d9def0]"
          }`
        }
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e9edff] text-[10px] font-bold text-[#536be8]">
          {initialsOf(user)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[10px] font-semibold text-[#35405d]">
            {displayNameOf(user)}
          </span>
          <span className="block text-[8px] text-[#9aa4b8]">
            {roleLabelOf(user?.role)}
          </span>
        </span>
      </NavLink>
    </div>
  );
};

export default SidebarUserCard;
