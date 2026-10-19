/**
 * DragHandle — the grip pill at the top of a mobile bottom sheet. Purely
 * visual: the drag gesture itself lives in OverlayContainer (swipe down to
 * collapse, swipe up to expand; tap still toggles).
 */
export default function DragHandle({ className = '' }) {
  return (
    <div
      className={`mx-auto flex h-4 w-14 items-center justify-center rounded-full bg-surface shadow-clay-xs ${className}`}
    >
      <span className="h-1 w-6 rounded-full bg-sunken" />
    </div>
  );
}
