import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useNavigate } from "react-router-dom";
import { LogOut, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../ui/ConfirmDialog";

/**
 * The shared account menu — ONE copy of the pop-out logic behind every
 * account entry point (desktop sidebar user card, mobile header chip): a
 * small menu with the two account destinations, Profile and Log out. The
 * caller owns the trigger element (Radix `asChild`) and its layout;
 * placement adapts to where the trigger sits (`side`/`align`).
 *
 * Log out is a terminal action: same confirmation dialog as the Profile
 * screen's sign-out row (see features/profile/SecuritySection).
 */
const ITEM_CLASS =
  "flex min-h-10 cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-2 text-[12px] font-semibold text-ink-soft outline-none transition hover:bg-surface-2 data-[highlighted]:bg-surface-2";

const AccountMenu = ({ trigger, side = "top", align = "start", sideOffset = 8 }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
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
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            side={side}
            align={align}
            sideOffset={sideOffset}
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
    </>
  );
};

export default AccountMenu;
