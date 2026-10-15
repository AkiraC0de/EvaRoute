import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import FacilityPage from "../features/facility/FacilityPage";
import HistoryPage from "../features/history/HistoryPage";
import OccupancyPage from "../features/occupancy/OccupancyPage";
import ProfilePage from "../features/profile/ProfilePage";
import UnauthorizedPage from "../features/errors/UnauthorizedPage";
import RequireRole from "./guards";
import { NAV_ITEMS, homePathFor } from "./navigation";
import { useAuth } from "../context/AuthContext";

/**
 * Route table. Paths and permissions are derived from app/navigation.js — the
 * same model the sidebar renders — so a screen cannot appear in the menu
 * without a route, and a route cannot exist without stated permissions.
 *
 * Every element is wrapped in RequireRole: manual URL entry to a screen the
 * user's role does not permit lands on the access-denied page.
 */

// Screen registry: nav item id -> page component.
const PAGES = {
  facility: FacilityPage,
  occupancy: OccupancyPage,
  history: HistoryPage,
  profile: ProfilePage,
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={homePathFor(user)} replace />} />
      <Route element={<AppShell />}>
        {NAV_ITEMS.map((item) => {
          const Page = PAGES[item.id];
          return (
            <Route
              key={item.id}
              path={item.to}
              element={
                <RequireRole roles={item.roles}>
                  <Page />
                </RequireRole>
              }
            />
          );
        })}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to={homePathFor(user)} replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
