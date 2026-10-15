import { ROLES, ALL_PORTAL_ROLES, hasRole } from "./roles";

/**
 * Navigation model — the single source of truth for BOTH the sidebar menu and
 * the route table (app/routes.jsx derives its paths/permissions from here), so
 * the two can never disagree.
 *
 * To restrict an item to one role, narrow its `roles` array — the sidebar
 * hides it and the route guard blocks manual URL entry. Detail screens (e.g.
 * /facilities/:facilityId) are not nav items; they are declared alongside the
 * table that links to them (see FACILITY_DETAIL in app/routes.jsx).
 */
export const NAV_SECTIONS = [
  {
    id: "operations",
    label: "Operations",
    items: [
      { id: "overview", label: "Overview", to: "/overview", home: true, roles: [ROLES.ADMIN] },
      { id: "facilities", label: "Facilities", to: "/facilities", roles: [ROLES.ADMIN] },
      { id: "staff", label: "Staff accounts", to: "/staff", roles: [ROLES.ADMIN] },
      { id: "occupancy", label: "Occupancy", to: "/occupancy", roles: ALL_PORTAL_ROLES },
    ],
  },
  {
    id: "manage",
    label: "Manage",
    items: [
      { id: "facility", label: "My Facility", to: "/facility", end: true, home: true, roles: [ROLES.FACILITY_STAFF] },
      { id: "history", label: "History", to: "/history", roles: ALL_PORTAL_ROLES },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { id: "profile", label: "Profile", to: "/profile", roles: ALL_PORTAL_ROLES },
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
