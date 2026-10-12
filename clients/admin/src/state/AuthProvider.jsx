import { useCallback, useEffect, useMemo, useState } from "react";
import * as api from "../lib/api";
import { AuthContext } from "./auth-context";

const USER_STORAGE_KEY = "evaroute.admin.user";

/**
 * Session states:
 *   "checking"  — a stored token is being validated on first paint
 *   "signedOut" — no usable session; the app shows the sign-in screen
 *   "signedIn"  — `user` holds the identity returned by POST /auth/login
 *
 * `user` is exactly the payload the API returns:
 *   { email, firstname, lastName, role, isSetupDone }
 * The API has no "who am I" endpoint for staff (GET /api/v1/staff/:userId needs
 * the admin-only FETCH_ALL_STAFF permission), so identity is persisted
 * alongside the token and re-validated on reload with a real API call.
 */
function readStoredUser() {
  try {
    const raw = window.sessionStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredUser(user) {
  try {
    if (user) window.sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    else window.sessionStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // Memory-only session is an acceptable degradation.
  }
}

const AuthProvider = ({ children }) => {
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
  // even though the httpOnly refresh cookie is still valid. Try the cookie
  // first (same-origin via the Vite proxy), then fall back to proving the
  // stored access token with a real request.
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      if (api.getAccessToken() && readStoredUser()) {
        try {
          const refreshed = await api.refreshSession();
          if (!cancelled) {
            writeStoredUser(refreshed);
            setUser(refreshed);
            setStatus("signedIn");
          }
          return;
        } catch {
          // No usable refresh cookie — fall through to the stored token.
        }
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
    () => ({ user, status, sessionMessage, signIn, signOut, signOutEverywhere }),
    [user, status, sessionMessage, signIn, signOut, signOutEverywhere],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
