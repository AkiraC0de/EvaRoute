import AppRoutes from "./routes";
import LoginPage from "../features/auth/LoginPage";
import { useAuth } from "../context/AuthContext";

/**
 * Application root: session gate over the role-guarded routes.
 *
 *   status "checking"  -> session splash
 *   status "signedOut" -> sign-in screen
 *   status "signedIn"  -> the authenticated portal (AppRoutes + AppShell)
 *
 * Every staff API route sits behind verifyAuthentication, so the portal
 * cannot show real data without a signed-in session.
 */
function App() {
  const { status } = useAuth();

  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#e9edf7] p-4">
        <p className="rounded-[18px] bg-white px-6 py-4 text-[13px] font-semibold text-[#65718c] shadow-[0_8px_20px_rgba(40,60,100,0.08)]">
          Checking your session…
        </p>
      </main>
    );
  }

  if (status === "signedOut") {
    return <LoginPage />;
  }

  return <AppRoutes />;
}

export default App;
