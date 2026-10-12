import { Navigate, Route, Routes } from "react-router-dom";
import StaffSidebar from "./components/StaffSidebar";
import StaffDashboard from "./components/StaffDashboard";
import OccupancyDashboard from "./components/OccupancyDashboard";
import ProfileDashboard from "./components/ProfileDashboard";
import LoginScreen from "./components/LoginScreen";
import { useAuth } from "./state/auth-context";

/**
 * Routing is unchanged from the imported app (/ -> /facility, plus /facility,
 * /occupancy, /history, /profile). The only addition is the session gate: every
 * staff API route is behind verifyAuthentication, so the portal cannot show
 * real data without a signed-in session.
 */
function App() {
  const { status } = useAuth();

  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#e9edf7] p-4">
        <p className="rounded-[18px] bg-white px-6 py-4 text-[11px] font-semibold text-[#65718c] shadow-[0_8px_20px_rgba(40,60,100,0.08)]">
          Checking your session…
        </p>
      </main>
    );
  }

  if (status === "signedOut") {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-[#e9edf7]">
      <StaffSidebar />
      <Routes>
        <Route path="/" element={<Navigate to="/facility" replace />} />
        <Route path="/facility" element={<StaffDashboard />} />
        <Route path="/occupancy" element={<OccupancyDashboard />} />
        <Route
          path="/history"
          element={
            <main className="ml-49.5 min-h-screen bg-[#e9edf7] p-6 max-sm:ml-0">
              <h1 className="text-[20px] font-bold text-[#273556]">History</h1>
              <p className="mt-1 text-[11px] text-[#8290aa]">
                Activity history is not available yet.
              </p>
            </main>
          }
        />
        <Route path="/profile" element={<ProfileDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
