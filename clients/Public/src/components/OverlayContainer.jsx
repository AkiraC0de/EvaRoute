import DragHandle from './ui/DragHandle';

/* Desktop floating-panel anchoring per variant. */
const desktopPosition = {
  sheet: 'md:top-[50%] md:right-6 md:translate-y-[calc(-50%-12px)]',
  panel: 'md:top-[50%] md:right-6 md:translate-y-[calc(-50%-12px)]',
  routeCard: 'md:bottom-6 md:right-6',
};

/**
 * OverlayContainer — one component, two layouts:
 * a mobile bottom sheet and a desktop floating panel.
 *
 * The `overlay-mobile-sheet` / `overlay-mobile-expanded-content` class names
 * are mechanics hooks (state CSS in global.css drives the sheet height and
 * hidden-content handling via data attributes); everything visual is
 * Tailwind utilities.
 */
export default function OverlayContainer({
  children,
  collapsedContent,
  variant = 'sheet',
  expanded = true,
  mobileExpanded = expanded,
  onMobileToggle,
  className = '',
}) {
  const desktopClass = desktopPosition[variant === 'route-card' ? 'routeCard' : variant];
  const isMobileExpanded = expanded && mobileExpanded;
  const isCollapsedRouteCard = variant === 'route-card' && !isMobileExpanded;

  return (
    <>
      {/* ── Mobile: bottom sheet ── */}
      <div
        data-variant={variant}
        data-mobile-expanded={isMobileExpanded}
        className={[
          'overlay-mobile-sheet',
          'fixed bottom-0 left-0 right-0 z-30 flex max-h-[calc(100dvh-20px)] h-[calc(100dvh-20px)] flex-col overflow-y-auto rounded-t-clay bg-surface shadow-clay-lg md:hidden',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div
          className={[
            'relative flex w-full min-w-0 flex-1 flex-col px-4',
            isCollapsedRouteCard
              ? 'pt-2 pb-[calc(8px+env(safe-area-inset-bottom))]'
              : 'pt-2 pb-[calc(20px+env(safe-area-inset-bottom))]',
            !isMobileExpanded && collapsedContent ? 'h-full items-center' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div
            className="overlay-mobile-expanded-content flex min-h-0 min-w-0 flex-1 flex-col"
            data-hidden={!isMobileExpanded}
            aria-hidden={!isMobileExpanded}
          >
            {onMobileToggle && isMobileExpanded && (
              <button
                type="button"
                className="flex h-11 w-full items-center justify-center border-0 bg-transparent p-0 touch-manipulation"
                onClick={onMobileToggle}
                aria-label="Collapse panel"
                aria-expanded="true"
              >
                <DragHandle />
              </button>
            )}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
          </div>
          {!isMobileExpanded && collapsedContent ? collapsedContent : null}
        </div>
      </div>

      {/* ── Desktop: floating panel ── */}
      <div
        data-variant={variant}
        className={[
          'overlay-desktop-panel',
          'hidden md:flex md:absolute md:z-30 md:max-h-[calc(100dvh-48px)] rounded-clay bg-surface shadow-clay-lg',
          variant === 'route-card' ? '' : 'md:h-[calc(100dvh-48px)]',
          desktopClass,
          !expanded ? 'md:min-w-[200px]' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ width: '400px' }}
      >
        <div className="w-full min-w-0 p-5">{children}</div>
      </div>
    </>
  );
}
