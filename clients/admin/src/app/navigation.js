import {
  Building2,
  History,
  Home,
  LayoutDashboard,
  SquareUser,
  Users,
  UserRound,
} from "lucide-react";
import { ROLES, ALL_PORTAL_ROLES, hasRole } from "./roles";

/**
 * Navigation model — the single source of truth for the sidebar rail
 * (desktop), the mobile bottom bar, and the route table (app/routes.jsx
 * derives its paths/permissions from here), so none of them can disagree.
 *
 * To restrict an item to one role, narrow its `roles` array — the menus
 * hide it and the route guard blocks manual URL entry. Detail screens (e.g.
 * /facilities/:facilityId) are not nav items; they are declared alongside the
 * table that links to them (see FACILITY_DETAIL in app/routes.jsx).
 *
 * `icon` is the nav glyph (a lucide component); `shortLabel` is the compact
 * caption used by the mobile bottom bar where width is tight. Adding a screen
 * is still a config change: pick an icon here and both menus render it.
 */
export const NAV_SECTIONS = [
  {
    id: "operations",
    label: "Operations",
    items: [
      { id: "overview", label: "Overview", shortLabel: "Overview", to: "/overview", home: true, icon: LayoutDashboard, roles: [ROLES.ADMIN] },
      { id: "facilities", label: "Facilities", shortLabel: "Facilities", to: "/facilities", icon: Building2, roles: [ROLES.ADMIN] },
      { id: "staff", label: "Staff accounts", shortLabel: "Staff", to: "/staff", icon: SquareUser, roles: [ROLES.ADMIN] },
      { id: "occupancy", label: "Occupancy", shortLabel: "Occupancy", to: "/occupancy", icon: Users, roles: ALL_PORTAL_ROLES },
    ],
  },
  {
    id: "manage",
    label: "Manage",
    items: [
      { id: "facility", label: "My Facility", shortLabel: "Facility", to: "/facility", end: true, home: true, icon: Home, roles: [ROLES.FACILITY_STAFF] },
      { id: "history", label: "History", shortLabel: "History", to: "/history", icon: History, roles: ALL_PORTAL_ROLES },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { id: "profile", label: "Profile", shortLabel: "Profile", to: "/profile", icon: UserRound, roles: ALL_PORTAL_ROLES },
    ],
  },
];

/** Every nav item flattened, in order. */
export const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

/** Items of one section the given user may see. */
export const visibleItems = (sectionId, user) => {
  const section = NAV_SECTIONS.find((entry) => entry.id === sectionId);
  return (section?.items ?? []).filter((item) => hasRole(user, item.roles));
};

/**
 * Landing page for a user: the item marked `home` that they are allowed to
 * see (admin → /overview, facility staff → /facility — the pre-existing staff
 * landing), falling back to the first visible item.
 */
export const homePathFor = (user) =>
  NAV_ITEMS.find((item) => item.home && hasRole(user, item.roles))?.to ??
  NAV_ITEMS.find((item) => hasRole(user, item.roles))?.to ??
  "/unauthorized";
