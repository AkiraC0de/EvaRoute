import { useCallback, useEffect, useState } from "react";
import Button from "./Button";
import ProfileField from "./ProfileField";
import SecurityAction from "./SecurityAction";
import StatusPanel from "./StatusPanel";
import * as api from "../lib/api";
import { useAuth } from "../state/auth-context";

/**
 * Profile — real identity, real sign-out.
 *
 * Identity comes from the login/refresh payload
 * ({ email, firstname, lastName, role, isSetupDone }); the assigned facility
 * comes from GET /api/v1/facility. Both are genuine API values.
 *
 * Removed because the API has no such field anywhere in the schema:
 *   - "Mobile No."  (no phone column on User)
 *   - "Staff ID EM-0241" (login does not return the user id)
 *   - "Joined Mar 2025" (createdAt is not returned by login or refresh)
 * Those rows were hardcoded demo data, not real records.
 *
 * Security actions:
 *   - Sign out                     -> POST /api/v1/auth/signout        (wired)
 *   - Sign out to all other devices-> POST /api/v1/auth/signout-all    (wired,
 *                                     the API requires the account password)
 *   - Password change              -> NOT wired: the backend only offers the
 *     unauthenticated 3-step email OTP flow (request-reset -> verify-reset ->
 *     reset), which needs email delivery and two extra screens.
 */

const LockIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

const SignOutIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
    <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
  </svg>
);

const roleLabel = (role) => {
  if (role === "FACILITY_STAFF") return "Facility staff";
  if (role === "ADMIN") return "Administrator";
  return role || "Staff account";
};

const ProfileDashboard = () => {
  const { user, signOut, signOutEverywhere } = useAuth();
  const [facility, setFacility] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [askingPassword, setAskingPassword] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    let cancelled = false;

    api
      .getAssignedFacility()
      .then((next) => {
        if (!cancelled) setFacility(next);
      })
      .catch(() => {
        if (!cancelled) setFacility(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      await signOut();
    } catch (err) {
      setError(err.message || "Sign out failed.");
      setBusy(false);
    }
  }, [signOut]);

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

  const fullName =
    [user?.firstname, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Staff account";

  const profileFields = [
    { label: "First Name", value: user?.firstname || "—" },
    { label: "Last Name", value: user?.lastName || "—" },
    { label: "Work Email", value: user?.email || "—" },
    { label: "Role", value: roleLabel(user?.role) },
    {
      label: "Assigned Facility",
      value: facility ? `${facility.name} · ${facility.address}` : "Not assigned",
    },
  ];

  return (
    <main className="ml-49.5 min-h-screen bg-[#e9edf7] p-6 max-sm:ml-0 max-sm:p-4">
      <header className="mb-3">
        <h1 className="text-[20px] font-bold leading-tight text-[#273556]">Profile</h1>
        <p className="mt-1 text-[11px] text-[#8290aa]">
          Manage your account and security
        </p>
      </header>

      <section
        aria-label="Staff account summary"
        className="mb-4 rounded-[20px] bg-white px-3 py-3 shadow-[0_8px_20px_rgba(40,60,100,0.08)] sm:px-3"
      >
        <h2 className="text-[12px] font-bold text-[#34405f]">{fullName}</h2>
        <p className="text-[9px] text-[#5f7197]">{user?.email || "—"}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#e9edf5] px-3 py-1 text-[8px] font-semibold text-[#7180a0]">
            {facility ? facility.name : "No facility assigned"}
          </span>
          <span className="rounded-full bg-[#e9edf5] px-3 py-1 text-[8px] font-semibold text-[#7180a0]">
            {roleLabel(user?.role)}
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
        <section aria-labelledby="account-information-heading">
          <h2
            id="account-information-heading"
            className="mb-3 text-[8px] font-semibold uppercase tracking-[1px] text-[#9aa8c5]"
          >
            Account Information
          </h2>
          <div className="min-h-[455px] rounded-[20px] bg-white p-3 shadow-[0_8px_20px_rgba(40,60,100,0.08)] sm:p-3">
            <div className="space-y-2">
              {profileFields.map(({ label, value }, index) => (
                <ProfileField key={`${label}-${index}`} label={label} value={value} />
              ))}
            </div>
            <p className="mt-4 px-1 text-[9px] leading-relaxed text-[#9aa4b8]">
              These fields are read-only: the API exposes no staff self-edit
              endpoint (PATCH /api/v1/staff/:userId requires the admin-only
              EDIT_STAFF_ACC permission). Phone number and staff ID are not part
              of the account model.
            </p>
          </div>
        </section>

        <section aria-labelledby="security-heading">
          <h2
            id="security-heading"
            className="mb-3 text-[8px] font-semibold uppercase tracking-[1px] text-[#9aa8c5]"
          >
            Security
          </h2>
          <div className="space-y-2 rounded-[20px] bg-white p-3 shadow-[0_8px_20px_rgba(40,60,100,0.08)]">
            <SecurityAction
              icon={<LockIcon />}
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
              icon={<SignOutIcon />}
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
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSignOutEverywhere();
                }}
                className="rounded-2xl bg-[#f6f8fc] px-3 py-3 shadow-[inset_0_2px_5px_rgba(40,55,90,0.12)]"
              >
                <label className="block">
                  <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
                    Confirm your password
                  </span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-9 w-full rounded-xl bg-white px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] focus:ring-2"
                  />
                </label>
                <p className="mt-2 text-[8px] text-[#8995ad]">
                  The API requires your password as proof of identity for this action.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="submit"
                    disabled={busy || !password}
                    className="px-3 py-1.5 text-[9px]"
                  >
                    {busy ? "Signing out…" : "Confirm"}
                  </Button>
                  <Button
                    variant="neutral"
                    onClick={() => {
                      setAskingPassword(false);
                      setPassword("");
                      setError("");
                    }}
                    className="px-3 py-1.5 text-[9px]"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <SecurityAction
              icon={<SignOutIcon />}
              title="Sign out"
              actionLabel="Sign out"
              variant="danger"
              onClick={handleSignOut}
            />

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-[#fbe4e3] px-3 py-2 text-[10px] font-semibold text-[#d8322d]"
              >
                {error}
              </p>
            )}

            {notice && (
              <div
                role="status"
                className="rounded-xl bg-[#f6f8fc] px-3 py-2 text-[10px] text-[#65718c]"
              >
                <p>{notice}</p>
                <Button
                  variant="neutral"
                  onClick={() => setNotice("")}
                  className="mt-2 px-2 py-1 text-[9px]"
                >
                  Dismiss
                </Button>
              </div>
            )}
          </div>

          {!error && !notice && (
            <p className="mt-3 text-[9px] leading-relaxed text-[#9aa4b8]">
              Sign-out actions call the live API. Password change is not wired.
            </p>
          )}
        </section>
      </div>

      {busy && !askingPassword && (
        <div className="mt-4">
          <StatusPanel title="Signing out…">
            Ending your session with the EvaRoute API.
          </StatusPanel>
        </div>
      )}
    </main>
  );
};

export default ProfileDashboard;
