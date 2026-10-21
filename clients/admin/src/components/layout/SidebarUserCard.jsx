import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, LogOut, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../ui/ConfirmDialog";
import { displayNameOf, initialsOf, roleLabelOf } from "../../lib/user";

/**
 * Signed-in user card at the bottom of the sidebar — the account MENU entry
 * (desktop entry point; on mobile the Profile nav link shows instead — see
 * SidebarNav). Clicking the card opens a small popover with the two account
 * destinations: Profile and Log out. Radix DropdownMenu gives menu keyboard
 * navigation, Escape and click-outside for free; the popover uses the shared
 * `popper-in` entrance.
 */
const ITEM_CLASS =
  "flex min-h-10 cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-2 text-[12px] font-semibold text-ink-soft outline-none transition hover:bg-surface-2 data-[highlighted]:bg-surface-2";

const SidebarUserCard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const onProfile = location.pathname === "/profile";
  // Log out is a terminal action: same confirmation dialog as the Profile
  // screen's sign-out row (see features/profile/SecuritySection).
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSignOut = async () => {
    setBusy(true);
    try {
      await signOut(); // session end redirects to "/"
      setConfirming(false); // close ONLY on success
    } catch {
      // stay signed in on failure — the dialog stays open so the user can
      // see the attempt failed and retry from the same place
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-t border-line p-3 max-sm:hidden">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
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
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            side="top"
            align="start"
            sideOffset={8}
            className="popper-in z-[70] w-52 overflow-hidden rounded-lg border border-line bg-surface p-1 shadow-lg"
          >
            <DropdownMenu.Item
              onSelect={() => navigate("/profile")}
              className={ITEM_CLASS}
            >
              <UserRound size={14} strokeWidth={1.9} aria-hidden="true" />
              Profile
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-line" />
            <DropdownMenu.Item
              onSelect={() => setConfirming(true)}
              className={`${ITEM_CLASS} text-danger hover:bg-danger-soft data-[highlighted]:bg-danger-soft`}
            >
              <LogOut size={14} strokeWidth={1.9} aria-hidden="true" />
              Log out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {confirming && (
        <ConfirmDialog
          title="Sign out of EvaRoute?"
          message="You will be signed out of this device immediately. Any unsaved work will be lost — you can sign back in at any time."
          confirmLabel="Sign out"
          tone="danger"
          busy={busy}
          onConfirm={handleSignOut}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
};

export default SidebarUserCard;
