import { type ReactNode } from 'react';
import DragHandle from './primitives/DragHandle';

/**
 * OverlayContainer — polymorphic responsive overlay.
 *
 * Mobile (< 768px): bottom sheet docked to bottom edge.
 *   - Expanded: full content with drag handle.
 *   - Collapsed: intentional compact content (NOT clipped full content).
 *     Pass collapsedContent for the compact mobile state.
 * Desktop (>= 768px): floating panel with fixed width, all corners rounded.
 *
 * Variants:
 *   'sheet' / 'panel'  — right-side floating panel on desktop (center list, detail)
 *   'route-card'        — bottom-right floating card on desktop (route summary, nav)
 */
interface OverlayContainerProps {
  children: ReactNode;
  collapsedContent?: ReactNode;
  variant?: 'sheet' | 'panel' | 'route-card';
  expanded?: boolean;
  className?: string;
}

const desktopPosition = {
  sheet: 'md:top-4 md:right-4',
  panel: 'md:top-4 md:right-4',
  routeCard: 'md:bottom-4 md:right-4',
};

export default function OverlayContainer({
  children,
  collapsedContent,
  variant = 'sheet',
  expanded = true,
  className = '',
}: OverlayContainerProps) {
  const isPanelVariant = variant === 'sheet' || variant === 'panel';
  const desktopClass = desktopPosition[variant === 'route-card' ? 'routeCard' : variant];

  return (
    <>
      {/* ── Mobile: bottom sheet ── */}
      <div
        className={[
          'fixed bottom-0 left-0 right-0 z-[var(--z-sheet)]',
          'bg-[var(--surface-raised)]',
          !expanded ? 'rounded-t-[var(--radius-lg)]' : 'rounded-none',
          'shadow-[var(--shadow-raised-lg)]',
          !expanded ? 'max-h-[100px] overflow-hidden' : 'max-h-[calc(100dvh-20px)] overflow-y-auto',
          'md:hidden',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div
          className={[
            'overlay-mobile-inner p-5',
            !expanded && collapsedContent ? 'h-full flex items-center' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {isPanelVariant && expanded && <DragHandle />}
          {!expanded && collapsedContent ? (
            collapsedContent
          ) : (
            children
          )}
        </div>
      </div>

      {/* ── Desktop: floating panel ── */}
      <div
        className={[
          'hidden md:flex md:absolute md:z-[var(--z-sheet)]',
          'bg-[var(--surface-raised)]',
          'rounded-[var(--radius-lg)]',
          'shadow-[var(--shadow-raised-lg)]',
          desktopClass,
          !expanded ? 'md:min-w-[200px]' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          width: variant === 'route-card' ? 'var(--route-card-width)' : 'var(--panel-width)',
        }}
      >
        <div className="overlay-desktop-inner p-5">
          {children}
        </div>
      </div>
    </>
  );
}
