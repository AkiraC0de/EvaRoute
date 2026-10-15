/**
 * Display helpers for the authenticated user payload returned by
 * POST /auth/login and GET /auth/refresh:
 *   { email, firstName, lastName, role, isSetupDone }
 *
 * Shared by the sidebar user card, the profile page and the login flow so the
 * same identity is formatted identically everywhere.
 */

export const initialsOf = (user) => {
  const source = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  if (source) {
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }
  return (user?.email?.[0] || "?").toUpperCase();
};

export const displayNameOf = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
  user?.email ||
  "Staff account";

export const roleLabelOf = (role) => {
  if (role === "FACILITY_STAFF") return "Facility staff";
  if (role === "ADMIN") return "Administrator";
  return role || "Staff account";
};
