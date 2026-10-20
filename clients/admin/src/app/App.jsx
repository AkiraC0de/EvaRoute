import AppRoutes from "./routes";
import LoginPage from "../features/auth/LoginPage";
import AccountSetupGate from "../features/account-setup/AccountSetupGate";
import { useAuth } from "../context/AuthContext";

/**
 * Application root: session gate over the role-guarded routes.
 *
 *   status "checking"  -> centered loading spinner
 *   status "signedOut" -> sign-in screen
 *   status "signedIn"  -> the authenticated portal (AppRoutes + AppShell),
 *                        with a blocking first-run setup modal when the
 *                        account has `isSetupDone: false`
 *
 * Every staff API route sits behind verifyAuthentication, so the portal
 * cannot show real data without a signed-in session.
 */
function App() {
  const { status } = useAuth();

  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas">
        <span
          role="status"
          aria-label="Checking your session"
          className="block h-11 w-11 animate-spin rounded-full border-[3px] border-primary-soft border-t-primary motion-reduce:animate-none"
        />
      </main>
    );
  }

  if (status === "signedOut") {
    return <LoginPage />;
  }

  return (
    <>
      <AppRoutes />
      <AccountSetupGate />
    </>
  );
}

export default App;
