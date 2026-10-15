import { useState } from "react";
import { Lock, LogOut } from "lucide-react";
import Banner from "../../components/ui/Banner";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import PasswordConfirmForm from "./PasswordConfirmForm";
import SecurityAction from "./SecurityAction";

/**
 * Security section of the profile page.
 *
 * Security actions:
 *   - Sign out                     -> POST /api/v1/auth/signout        (wired)
 *   - Sign out to all other devices-> POST /api/v1/auth/signout-all    (wired,
 *                                     the API requires the account password)
 *   - Password change              -> NOT wired: the backend only offers the
 *                                     unauthenticated 3-step email OTP flow
 *                                     (request-reset -> verify-reset ->
 *                                     reset), which lives on the sign-in
 *                                     screen, not in an authenticated session.
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
      <div className="space-y-2 rounded-[20px] bg-white p-3 shadow-[0_8px_20px_rgba(40,60,100,0.08)]">
      <SecurityAction
        icon={<Lock size={15} strokeWidth={1.8} />}
        title="Password"
        description="via email OTP"
        actionLabel="Change"
        showArrow
        onClick={() => {
          setError("");
          setNotice(
            "Not available in this portal yet. The API's only password change is the email OTP flow (GET /api/v1/auth/password/request-reset, then verify-reset, then reset) and it is not wired to a screen here. Ask an administrator to reset your password.",
          );
        }}
      />

      <SecurityAction
        icon={<LogOut size={15} strokeWidth={1.8} />}
        title="Sign out to all other devices"
        actionLabel="Sign out to all other devices"
        variant="danger"
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
        actionLabel="Sign out"
        variant="danger"
        onClick={handleSignOut}
      />

      {error && <Banner tone="error">{error}</Banner>}

      {notice && (
        <Banner tone="info">
          <p>{notice}</p>
          <Button
            variant="neutral"
            onClick={() => setNotice("")}
            className="mt-2 px-2 py-1 text-[9px]"
          >
            Dismiss
          </Button>
        </Banner>
      )}
      </div>

      {!error && !notice && (
        <p className="mt-3 text-[9px] leading-relaxed text-[#9aa4b8]">
          Sign-out actions call the live API. Password change is not wired.
        </p>
      )}
    </>
  );
};

export default SecuritySection;
