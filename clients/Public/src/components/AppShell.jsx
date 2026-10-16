/**
 * AppShell — the root layout container for EvaRoute.
 *
 * Full-viewport, overlay-based architecture: the map is the background
 * layer and overlays stack on top of it (children include both areas).
 */
export default function AppShell({ children }) {
  return (
    <div className="relative h-dvh w-screen overflow-hidden">
      <div className="absolute inset-0 z-[1]">{children}</div>
    </div>
  );
}
