/**
 * Session persistence for the staff portal.
 *
 * The identity payload ({ email, firstName, lastName, role, isSetupDone })
 * returned by POST /auth/login and GET /auth/refresh is stored beside the
 * access token so a reload can restore the session without a "who am I"
 * endpoint (the API has none for staff).
 *
 * All access is guarded: storage can be unavailable (private mode / blocked
 * cookies), in which case the session is memory-only for the tab's lifetime.
 */

const USER_STORAGE_KEY = "evaroute.admin.user";

export function readStoredUser() {
  try {
    const raw = window.sessionStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeStoredUser(user) {
  try {
    if (user) window.sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    else window.sessionStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // Memory-only session is an acceptable degradation.
  }
}
