import { createContext, useContext } from "react";

/**
 * Toast contract shared by the provider (Toast.jsx) and its consumers —
 * kept in a plain module so Fast Refresh sees only components in Toast.jsx.
 */
export const ToastContext = createContext(null);

/** Safe outside a provider (e.g. tests): a no-op toast API. */
export const useToast = () =>
  useContext(ToastContext) ??
  { success: () => {}, error: () => {}, dismiss: () => {} };
