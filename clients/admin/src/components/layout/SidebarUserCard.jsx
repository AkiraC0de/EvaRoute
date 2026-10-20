import { NavLink } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { displayNameOf, initialsOf, roleLabelOf } from "../../lib/user";

/**
 * Signed-in user card at the bottom of the sidebar — a quiet translucent
 * pill on the navy rail that signals the Profile screen it links to (desktop
 * entry point; on mobile the Profile nav link shows instead — see SidebarNav).
 */
const SidebarUserCard = () => {
  const { user } = useAuth();

  return (
    <div className="border-t border-white/10 p-3 max-sm:hidden">
      <NavLink
        to="/profile"
        aria-label={`View profile for ${displayNameOf(user)}`}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-md px-3 py-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 ${
            isActive ? "bg-white/16" : "hover:bg-white/10"
          }`
        }
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-[12px] font-bold text-white">
          {initialsOf(user)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-semibold text-white">
            {displayNameOf(user)}
          </span>
          <span className="block text-[10px] text-white/55">
            {roleLabelOf(user?.role)}
          </span>
        </span>
        <ChevronRight
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className="shrink-0 text-white/55"
        />
      </NavLink>
    </div>
  );
};

export default SidebarUserCard;
