import { useState } from "react";
import { LogOut, MonitorOff } from "lucide-react";
import Banner from "../../components/ui/Banner";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import PasswordConfirmForm from "./PasswordConfirmForm";
import ChangePasswordAction from "./password/ChangePasswordAction";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import SecurityAction from "./SecurityAction";

/**
 * Security section of the profile page.
 *
 * Security actions:
 *   - Password change              -> POST /api/v1/auth/password/change
 *                                     (own component: features/profile/password/)
 *   - Sign out                     -> POST /api/v1/auth/signout        (wired)
 *   - Sign out to all other devices-> POST /api/v1/auth/signout-all    (wired,
 *                                     the API requires the account password)
 * `onBusyChange(busy)` reports the plain-sign-out in-flight state so the page
 * can render its status panel below the grid (matching the original layout).
 */
const SecuritySection = ({ onBusyChange }) => {
  const { signOut, signOutEverywhere } = useAuth();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [askingPassword, setAskingPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  const handleSignOut = async () => {
    setBusy(true);
    onBusyChange?.(true);
    setError("");
    try {
      await signOut();
    } catch (err) {
      setError(err.message || "Sign out failed.");
      setBusy(false);
      onBusyChange?.(false);
      // Close the dialog on failure so the error banner is visible again.
      setConfirmingSignOut(false);
    }
  };

  const handleSignOutEverywhere = async () => {
    setBusy(true);
    setError("");
    try {
      await signOutEverywhere(password);
      setPassword("");
      setAskingPassword(false);
      setNotice("Signed out from all other devices.");
    } catch (err) {
      setError(err.message || "Could not sign out the other devices.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Card className="space-y-2">
        <ChangePasswordAction />

        {/* Recovery action — neutral treatment (the theme audit: only the
            terminal action gets the danger styling; this one is reversible
            and password-gated). */}
        <SecurityAction
          icon={<MonitorOff size={15} strokeWidth={1.8} />}
          title="Sign out to all other devices"
          description="Requires your password. This device stays signed in."
          actionLabel="Sign out everywhere"
          variant="neutral"
          onClick={() => {
            setError("");
            setNotice("");
            setAskingPassword(true);
          }}
        />

        {askingPassword && (
          <PasswordConfirmForm
            password={password}
            onPasswordChange={setPassword}
            onSubmit={handleSignOutEverywhere}
            onCancel={() => {
              setAskingPassword(false);
              setPassword("");
              setError("");
            }}
            busy={busy}
          />
        )}

        <SecurityAction
          icon={<LogOut size={15} strokeWidth={1.8} />}
          title="Sign out"
          description="Ends this session immediately."
          actionLabel="Sign out"
          variant="danger"
          onClick={() => {
            setError("");
            setNotice("");
            setConfirmingSignOut(true);
          }}
        />

        {error && <Banner tone="error">{error}</Banner>}

        {notice && (
          <Banner tone="info">
            <p>{notice}</p>
            <Button
              variant="neutral"
              size="sm"
              onClick={() => setNotice("")}
              className="mt-2"
            >
              Dismiss
            </Button>
          </Banner>
        )}
      </Card>

      {!error && !notice && (
        <p className="mt-3 text-[11px] leading-relaxed text-muted">
          Sign-out takes effect immediately. Changing your password keeps this
          device signed in and signs out every other device.
        </p>
      )}

      {confirmingSignOut && (
        <ConfirmDialog
          title="Sign out of EvaRoute?"
          message="You will be signed out of this device immediately. Any unsaved work will be lost — you can sign back in at any time."
          confirmLabel="Sign out"
          tone="danger"
          busy={busy}
          onConfirm={handleSignOut}
          onCancel={() => setConfirmingSignOut(false)}
        />
      )}
    </>
  );
};

export default SecuritySection;
