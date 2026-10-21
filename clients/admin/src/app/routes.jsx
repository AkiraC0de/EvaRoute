import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "../components/layout/AppShell";

// Route-level code splitting: each screen ships in its own chunk (Leaflet,
// html2canvas and Recharts stop riding the initial payload just to show the
// login screen). AppShell stays eager — it is the persistent chrome.
const FacilityDetailPage = lazy(() => import("../features/admin/facilities/FacilityDetailPage"));
const FacilitiesPage = lazy(() => import("../features/admin/facilities/FacilitiesPage"));
const OverviewPage = lazy(() => import("../features/admin/OverviewPage"));
const StaffAccountsPage = lazy(() => import("../features/admin/StaffAccountsPage"));
const FacilityPage = lazy(() => import("../features/facility/FacilityPage"));
const HistoryPage = lazy(() => import("../features/history/HistoryPage"));
const OccupancyPage = lazy(() => import("../features/occupancy/OccupancyPage"));
const ProfilePage = lazy(() => import("../features/profile/ProfilePage"));
const UnauthorizedPage = lazy(() => import("../features/errors/UnauthorizedPage"));

import RequireRole from "./guards";
import { NAV_ITEMS, homePathFor } from "./navigation";
import { ROLES } from "./roles";
import { useAuth } from "../context/AuthContext";

/**
 * Route table. Nav-item paths and permissions are derived from
 * app/navigation.js — the same model the sidebar renders — so a screen cannot
 * appear in the menu without a route, and a route cannot exist without stated
 * permissions. Detail screens (not menu entries) are declared in
 * DETAIL_ROUTES below with their own roles.
 *
 * Every element is wrapped in RequireRole: manual URL entry to a screen the
 * user's role does not permit lands on the access-denied page.
 */

// Screen registry: nav item id -> page component.
const PAGES = {
  overview: OverviewPage,
  facilities: FacilitiesPage,
  staff: StaffAccountsPage,
  facility: FacilityPage,
  occupancy: OccupancyPage,
  history: HistoryPage,
  profile: ProfilePage,
};

// Detail screens: not in the menu, but reachable from their table/page.
const DETAIL_ROUTES = [
  {
    path: "/facilities/:facilityId",
    roles: [ROLES.ADMIN],
    element: <FacilityDetailPage />,
  },
];

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
        {DETAIL_ROUTES.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<RequireRole roles={route.roles}>{route.element}</RequireRole>}
          />
        ))}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to={homePathFor(user)} replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
