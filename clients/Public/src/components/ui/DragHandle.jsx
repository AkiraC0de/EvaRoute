/**
 * DragHandle — the grip pill at the top of a mobile bottom sheet.
 * Visual indicator only; drag behaviour is deferred.
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
