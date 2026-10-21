import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { displayNameOf, initialsOf } from "../../lib/user";
import AccountMenu from "./AccountMenu";

/**
 * Mobile header account chip (hidden on sm+ where the sidebar user card
 * takes over). It sits at the RIGHT end of the header row (the brand leads
 * at the left) and opens the same shared AccountMenu pop-out — Profile or
 * Log out — that the desktop user card uses, so both views share one
 * account logic.
 */
const MobileAccountChip = () => {
  const { user } = useAuth();
  const location = useLocation();
  const onProfile = location.pathname === "/profile";

  return (
    <div className="ml-auto shrink-0 sm:hidden">
      <AccountMenu
        side="bottom"
        trigger={
          <button
            type="button"
            aria-label={`Account menu for ${displayNameOf(user)}`}
            className={`flex min-h-11 items-center gap-1 rounded-full py-1 pl-1 pr-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink ${
              onProfile ? "bg-primary-soft" : "hover:bg-surface-2"
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[12px] font-bold text-primary-strong">
              {initialsOf(user)}
            </span>
            <ChevronDown
              size={13}
              strokeWidth={2}
              aria-hidden="true"
              className="shrink-0 text-muted-dim"
            />
          </button>
        }
      />
    </div>
  );
};

export default MobileAccountChip;
