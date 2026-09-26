/**
 * DragHandle — small horizontal pill at top center of a mobile bottom sheet.
 * Visual indicator only; drag behavior is deferred.
 */
export default function DragHandle() {
  return (
    <div className="drag-handle w-10 h-1 rounded-full bg-[var(--surface-inset)] mx-auto mt-3" />
  );
}
