import { NavLink } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { displayNameOf, initialsOf, roleLabelOf } from "../../lib/user";

/**
 * Signed-in user card at the bottom of the sidebar — a quiet recessed pill
 * that lifts on hover and signals the Profile screen it links to (desktop
 * entry point; on mobile the Profile nav link shows instead — see SidebarNav).
 */
const SidebarUserCard = () => {
  const { user } = useAuth();

  return (
    <div className="p-3 max-sm:hidden">
      <NavLink
        to="/profile"
        aria-label={`View profile for ${displayNameOf(user)}`}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-clay-sm px-3 py-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            isActive
              ? "bg-accent-soft ring-1 ring-accent/25"
              : "bg-sunken hover:bg-accent-soft/60"
          }`
        }
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[12px] font-bold text-accent-strong">
          {initialsOf(user)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-semibold text-ink-soft">
            {displayNameOf(user)}
          </span>
          <span className="block text-[10px] text-muted-dim">
            {roleLabelOf(user?.role)}
          </span>
        </span>
        <ChevronRight
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className="shrink-0 text-muted-dim"
        />
      </NavLink>
    </div>
  );
};

export default SidebarUserCard;
