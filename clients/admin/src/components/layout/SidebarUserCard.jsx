import { useLocation } from "react-router-dom";
import { ChevronRight } from "../../components/icons/evaIcons";
import { useAuth } from "../../context/AuthContext";
import { displayNameOf, initialsOf, roleLabelOf } from "../../lib/user";
import AccountMenu from "./AccountMenu";

/**
 * Signed-in user card at the bottom of the sidebar — the desktop account
 * MENU entry (on mobile the header chip shows instead — see
 * MobileAccountChip). Clicking the card opens the shared AccountMenu
 * pop-out with the two account destinations: Profile and Log out.
 */
const SidebarUserCard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const onProfile = location.pathname === "/profile";

  return (
    <div className="border-t border-line p-3 max-sm:hidden">
      <AccountMenu
        trigger={
          <button
            type="button"
            aria-label={`Account menu for ${displayNameOf(user)}`}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink ${
              onProfile ? "bg-primary-soft" : "hover:bg-surface-2"
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[12px] font-bold text-primary-strong">
              {initialsOf(user)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold text-ink-soft">
                {displayNameOf(user)}
              </span>
              <span className="block text-[10px] text-muted">
                {roleLabelOf(user?.role)}
              </span>
            </span>
            <ChevronRight
              size={14}
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

export default SidebarUserCard;
