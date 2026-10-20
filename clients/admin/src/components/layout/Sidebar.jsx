import SidebarNav from "./SidebarNav";
import SidebarUserCard from "./SidebarUserCard";

/**
 * Authenticated application sidebar — a clean white rail with a hairline
 * separation from the canvas. Brand header on top, role-filtered navigation
 * in the middle, the account card pinned at the bottom. (The EvaRoute logo
 * is light-background artwork, so it sits in its own bordered tile.)
 */
const Sidebar = () => (
  <aside className="fixed left-0 top-0 z-50 flex h-screen w-49.5 flex-col border-b border-line bg-surface sm:border-b-0 sm:border-r max-sm:relative max-sm:h-auto max-sm:w-full">
    <div className="flex h-23 items-center px-5 max-sm:h-18">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-surface">
          <img src="./evaRouteLogo.png" alt="EvaRoute logo" className="h-full w-full object-contain" />
        </div>
        <div>
          <p className="text-[16px] font-bold text-ink">EvaRoute</p>
          <p className="text-[10px] font-medium tracking-[1px] text-muted">
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
