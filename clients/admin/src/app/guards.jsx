import { Navigate, useLocation } from "react-router-dom";
import { hasRole } from "./roles";
import { useAuth } from "../context/AuthContext";

/**
 * Route-level role guard (UI layer only — the server enforces the same rules
 * per endpoint via verifyAuthorization).
 *
 * Renders the page when the signed-in user holds one of `roles`; otherwise
 * sends them to the access-denied page instead of silently blanking the
 * content area.
 */
const RequireRole = ({ roles, children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!hasRole(user, roles)) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default RequireRole;
