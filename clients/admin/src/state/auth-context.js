import { createContext, useContext } from "react";

/**
 * Session context for the staff portal.
 *
 * Kept in its own module (no components) so React Fast Refresh still works for
 * the provider in ./AuthProvider.jsx.
 */
export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return context;
}
