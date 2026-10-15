
import SidebarNav from "./SidebarNav";
import SidebarUserCard from "./SidebarUserCard";

/**
 * Authenticated application sidebar: brand header, role-filtered navigation
 * and the account card. Shared by every screen of the signed-in portal.
 */
const Sidebar = () => (
  <aside className="fixed left-0 top-0 z-50 flex h-screen w-49.5 flex-col bg-[#f5f7fc] max-sm:relative max-sm:h-auto max-sm:w-full">
    <div className="flex h-23 items-center px-5 max-sm:h-18">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm">
          <img src="./evaRouteLogo.png" alt="EvaRoute logo" className="h-full w-full object-contain" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#273556]">EvaRoute</p>
          <p className="text-[8px] font-medium tracking-[1px] text-[#9ba5bb]">
            STAFF PORTAL
          </p>
        </div>
      </div>
    </div>

    <SidebarNav />
    <SidebarUserCard />
  </aside>
);

export default Sidebar;
