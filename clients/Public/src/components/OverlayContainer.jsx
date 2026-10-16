import DragHandle from './ui/DragHandle';
const desktopPosition = {
    sheet: 'md:top-[50%] md:right-[var(--space-panel-margin)] md:translate-y-[calc(-50%-12px)]',
    panel: 'md:top-[50%] md:right-[var(--space-panel-margin)] md:translate-y-[calc(-50%-12px)]',
    routeCard: 'md:bottom-[var(--space-panel-margin)] md:right-[var(--space-panel-margin)]',
};
export default function OverlayContainer({ children, collapsedContent, variant = 'sheet', expanded = true, mobileExpanded = expanded, onMobileToggle, className = '', }) {
    const desktopClass = desktopPosition[variant === 'route-card' ? 'routeCard' : variant];
    const isMobileExpanded = expanded && mobileExpanded;
    return (<>
      {/* ── Mobile: bottom sheet ── */}
      <div data-variant={variant} data-mobile-expanded={isMobileExpanded} className={[
            'overlay-mobile-sheet',
            'fixed bottom-0 left-0 right-0 z-[var(--z-sheet)]',
            'bg-[var(--surface-raised)]',
            'rounded-t-[var(--radius-lg)]',
            'shadow-[var(--shadow-raised-lg)]',
            'md:hidden',
            className,
        ]
            .filter(Boolean)
            .join(' ')}>
        <div className={[
            'overlay-mobile-inner p-5 relative',
            !isMobileExpanded && collapsedContent ? 'h-full flex items-center' : '',
        ]
            .filter(Boolean)
            .join(' ')}>
          <div className="overlay-mobile-expanded-content" data-hidden={!isMobileExpanded} aria-hidden={!isMobileExpanded}>
            {onMobileToggle && isMobileExpanded && (<button type="button" className="overlay-mobile-toggle" onClick={onMobileToggle} aria-label="Collapse panel" aria-expanded="true">
                <DragHandle />
              </button>)}
            <div className="overlay-mobile-content">
              {children}
            </div>
          </div>
          {!isMobileExpanded && collapsedContent ? (collapsedContent) : null}
        </div>
      </div>

      {/* ── Desktop: floating panel ── */}
      <div data-variant={variant} className={[
            'overlay-desktop-panel',
            'hidden md:flex md:absolute md:z-[var(--z-sheet)]',
            'bg-[var(--surface-raised)]',
            'rounded-[var(--radius-lg)]',
            'shadow-[var(--shadow-raised-lg)]',
            desktopClass,
            !expanded ? 'md:min-w-[200px]' : '',
            className,
        ]
            .filter(Boolean)
            .join(' ')} style={{
            width: variant === 'route-card' ? 'var(--route-card-width)' : 'var(--panel-width)',
        }}>
        <div className="overlay-desktop-inner p-5">
          {children}
        </div>
      </div>
    </>);
}
