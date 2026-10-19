import { useCallback, useEffect, useMemo, useState } from "react";
import * as api from "../lib/api";
import { readStoredUser, writeStoredUser } from "../lib/sessionStorage";
import { AuthContext } from "./AuthContext";

/**
 * Session state for the staff portal.
 *
 * Session states:
 *   "checking"  — a stored session is being validated on first paint
 *   "signedOut" — no usable session; the app shows the sign-in screen
 *   "signedIn"  — `user` holds the identity returned by POST /auth/login
 *
 * `user` is exactly the payload the API returns:
 *   { email, firstName, lastName, role, isSetupDone }
 * The API has no "who am I" endpoint for staff (GET /api/v1/staff/:userId needs
 * the admin-only FETCH_ALL_STAFF permission), so identity is persisted
 * alongside the token (see lib/sessionStorage.js) and re-validated on reload
 * with a real API call.
 *
 * Scope: authentication only. Feature data (facility, resources, …) lives in
 * feature-level hooks, not here.
 */
function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [status, setStatus] = useState("checking");
  const [sessionMessage, setSessionMessage] = useState("");

  const forgetSession = useCallback((message = "") => {
    api.clearAccessToken();
    writeStoredUser(null);
    setUser(null);
    setStatus("signedOut");
    setSessionMessage(message);
  }, []);

  // Any authenticated 401 from anywhere in the app ends the session here.
  useEffect(() => {
    api.setUnauthorizedHandler(() => {
      forgetSession("Your session has expired. Please sign in again.");
    });
    return () => api.setUnauthorizedHandler(null);
  }, [forgetSession]);

  // Validate a restored session before rendering the portal.
  //
  // Order matters: the access token only lives 15 minutes
  // (ACCESS_TOKEN.EXPIRATION), so a reload after that would look signed out
  // even though the httpOnly refresh cookie is still valid. The cookie path
  // comes first and is unconditional — GET /auth/refresh returns a fresh
  // access token AND the user identity, so the cookie alone can restore a
  // full session (new tab, browser restart). The stored access token is only
  // a fallback when the cookie is missing or expired.
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      try {
        // refreshAccessToken is single-flight: StrictMode's double-invoked
        // effect shares ONE /auth/refresh call instead of racing two
        // rotations against the same cookie.
        const refreshed = await api.refreshAccessToken();
        if (!cancelled) {
          writeStoredUser(refreshed);
          setUser(refreshed);
          setStatus("signedIn");
        }
        return;
      } catch {
        // No usable refresh cookie — fall through to the stored token.
      }

      if (!api.getAccessToken() || !readStoredUser()) {
        if (!cancelled) {
          api.clearAccessToken();
          setStatus("signedOut");
        }
        return;
      }

      try {
        await api.getAssignedFacility();
        if (!cancelled) setStatus("signedIn");
      } catch {
        if (!cancelled) forgetSession("Your session has expired. Please sign in again.");
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
  }, [forgetSession]);

  const updateUser = useCallback((nextUser) => {
    writeStoredUser(nextUser);
    setUser(nextUser);
  }, []);

  const signIn = useCallback(async ({ email, password, keepLogin }) => {
    const nextUser = await api.login({ email, password, keepLogin });
    writeStoredUser(nextUser);
    setUser(nextUser);
    setSessionMessage("");
    setStatus("signedIn");
    return nextUser;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.signOut();
    } finally {
      forgetSession("");
    }
  }, [forgetSession]);

  const signOutEverywhere = useCallback(async (password) => {
    // Errors propagate so the caller can show the API's own message.
    await api.signOutAllDevices(password);
  }, []);

  const value = useMemo(
    () => ({ user, status, sessionMessage, signIn, signOut, signOutEverywhere, updateUser }),
    [user, status, sessionMessage, signIn, signOut, signOutEverywhere, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
