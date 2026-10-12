import { NavLink } from "react-router-dom";
import logo from "../assets/EvaRoute Logo.png";
import { useAuth } from "../state/auth-context";

const initialsOf = (user) => {
  const source = [user?.firstname, user?.lastName].filter(Boolean).join(" ");
  if (source) {
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }
  return (user?.email?.[0] || "?").toUpperCase();
};

const displayNameOf = (user) =>
  [user?.firstname, user?.lastName].filter(Boolean).join(" ") ||
  user?.email ||
  "Staff account";

const roleLabelOf = (role) => {
  if (role === "FACILITY_STAFF") return "Facility staff";
  if (role === "ADMIN") return "Administrator";
  return role || "Staff account";
};

const navItems = [
  { label: "My Facility", to: "/facility", end: true },
  { label: "Occupancy", to: "/occupancy" },
  { label: "History", to: "/history" },
];

const StaffSidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-49.5 flex-col bg-[#f5f7fc] max-sm:relative max-sm:h-auto max-sm:w-full">
      <div className="flex h-23 items-center px-5 max-sm:h-18">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm">
            <img src={logo} alt="EvaRoute logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#273556]">EvaRoute</h1>
            <p className="text-[8px] font-medium tracking-[1px] text-[#9ba5bb]">
              STAFF PORTAL
            </p>
          </div>
        </div>
      </div>

      <nav aria-label="Staff navigation" className="flex-1 px-3 max-sm:flex max-sm:flex-wrap max-sm:gap-1 max-sm:pb-3">
        <p className="mb-3 ml-2 text-[8px] font-semibold uppercase tracking-[1.5px] text-[#a2acc0] max-sm:hidden">
          Manage
        </p>
        {navItems.map(({ label, to, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `mb-1 flex w-full items-center rounded-xl px-3 py-2.5 text-left transition max-sm:w-auto ${
                isActive
                  ? "bg-white shadow-[0_4px_12px_rgba(50,70,120,0.08)]"
                  : "hover:bg-white"
              }`
            }
          >
            {({ isActive }) => (
              <span
                className={`text-[11px] ${
                  isActive
                    ? "font-semibold text-[#3554d1]"
                    : "font-medium text-[#687594]"
                }`}
              >
                {label}
              </span>
            )}
          </NavLink>
        ))}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `hidden w-full items-center rounded-xl px-3 py-2.5 text-left transition max-sm:flex max-sm:w-auto ${
              isActive
                ? "bg-white shadow-[0_4px_12px_rgba(50,70,120,0.08)]"
                : "hover:bg-white"
            }`
          }
        >
          {({ isActive }) => (
            <span
              className={`text-[11px] ${
                isActive
                  ? "font-semibold text-[#3554d1]"
                  : "font-medium text-[#687594]"
              }`}
            >
              Profile
            </span>
          )}
        </NavLink>

        <p className="mb-3 ml-2 mt-4 text-[8px] font-semibold uppercase tracking-[1.5px] text-[#a2acc0] max-sm:hidden">
          Account
        </p>
      </nav>

      <div className="p-3 max-sm:hidden">
        <NavLink
          to="/profile"
          aria-label={`View profile for ${displayNameOf(user)}`}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl border px-3 py-2 ${
              isActive
                ? "border-[#b7c2ff] bg-white shadow-[0_4px_12px_rgba(50,70,120,0.08)]"
                : "border-transparent bg-white shadow-[0_4px_12px_rgba(50,70,120,0.08)] hover:border-[#d9def0]"
            }`
          }
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e9edff] text-[10px] font-bold text-[#536be8]">
            {initialsOf(user)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[10px] font-semibold text-[#35405d]">
              {displayNameOf(user)}
            </span>
            <span className="block text-[8px] text-[#9aa4b8]">
              {roleLabelOf(user?.role)}
            </span>
          </span>
        </NavLink>
      </div>
    </aside>
  );
};

export default StaffSidebar;
