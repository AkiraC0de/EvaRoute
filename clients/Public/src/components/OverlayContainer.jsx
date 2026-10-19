import { useRef } from 'react';
import { motion, useDragControls } from 'motion/react';
import DragHandle from './ui/DragHandle';
import { motionTokens } from '../lib/motion';

/* Desktop floating-panel anchoring per variant. */
const desktopPosition = {
  sheet: 'md:top-[50%] md:right-6 md:translate-y-[calc(-50%-12px)]',
  panel: 'md:top-[50%] md:right-6 md:translate-y-[calc(-50%-12px)]',
  routeCard: 'md:bottom-6 md:right-6',
};

const { duration, easing, distance } = motionTokens;

/* Motion must preserve spatial continuity: the mobile sheet rises from the
   bottom edge it lives on; the desktop panel slides in from the right edge
   it docks to. Transform/opacity only. */
const sheetMotion = {
  initial: { opacity: 0, y: distance.lg * 2 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.normal, ease: easing.smooth } },
  exit: { opacity: 0, y: distance.lg * 2, transition: { duration: duration.fast, ease: easing.sharp } },
};

const panelMotion = {
  initial: { opacity: 0, x: distance.lg },
  animate: { opacity: 1, x: 0, transition: { duration: duration.normal, ease: easing.smooth } },
  exit: { opacity: 0, x: distance.lg, transition: { duration: duration.fast, ease: easing.sharp } },
};

const pillMotion = {
  initial: { opacity: 0, y: distance.sm },
  animate: { opacity: 1, y: 0, transition: { duration: duration.normal, ease: easing.smooth } },
  exit: { opacity: 0, y: distance.sm, transition: { duration: duration.fast, ease: easing.sharp } },
};

/**
 * OverlayContainer — one component, two layouts:
 * a mobile bottom sheet and a desktop floating panel.
 *
 * The `overlay-mobile-sheet` / `overlay-mobile-expanded-content` class names
 * are mechanics hooks (state CSS in global.css drives the sheet height and
 * hidden-content handling via data attributes); everything visual is
 * Tailwind utilities, all motion is motion/react.
 */
export default function OverlayContainer({
  children,
  collapsedContent,
  variant = 'sheet',
  expanded = true,
  mobileExpanded = expanded,
  onMobileToggle,
  mobileClosedPill = null,
  className = '',
}) {
  const desktopClass = desktopPosition[variant === 'route-card' ? 'routeCard' : variant];
  const isMobileExpanded = expanded && mobileExpanded;
  const isCollapsedRouteCard = variant === 'route-card' && !isMobileExpanded;
  /* "Map-first" mode (discovery): when the mobile sheet is closed, hide it
     entirely and float a small open-pill instead — the map is fully visible
     first; the sheet appears only when the user asks for it. */
  const isPillClosed = Boolean(mobileClosedPill) && !isMobileExpanded;

  /* Sheet drag gestures (mobile): swipe DOWN from the expanded sheet to
     collapse it, swipe UP from the collapsed bar to expand it. The drag
     starts only from the grip bar / collapsed bar (dragListener={false} +
     dragControls), so scrolling the sheet's content never fights the
     gesture. A tap still toggles — the capture guard swallows the click
     that follows a drag so one gesture can't toggle twice. */
  const dragControls = useDragControls();
  const lastDragAtRef = useRef(0);

  const handleDragStart = (event) => {
    dragControls.start(event);
  };

  const handleDragEnd = (event, info) => {
    const moved = Math.abs(info.offset.y) > 8 || Math.abs(info.velocity.y) > 300;
    // A drag that ends by momentum can skip the trailing click entirely, so
    // the guard is a TIME WINDOW after the drag, not a flag — a stale flag
    // would swallow the next, unrelated tap.
    if (moved) lastDragAtRef.current = Date.now();
    if (!isMobileExpanded) {
      if (info.offset.y < -40 || info.velocity.y < -500) onMobileToggle?.();
      return;
    }
    if (info.offset.y > 60 || info.velocity.y > 500) onMobileToggle?.();
  };

  const swallowClickIfDragged = (event) => {
    if (Date.now() - lastDragAtRef.current < 400) {
      lastDragAtRef.current = 0;
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <>
      {/* ── Mobile: floating open-pill when closed (map-first) ── */}
      {isPillClosed ? (
        <motion.div
          {...pillMotion}
          className="fixed bottom-[calc(14px+env(safe-area-inset-bottom))] left-1/2 z-30 -translate-x-1/2 md:hidden"
          data-overlay-pill="true"
        >
          {mobileClosedPill}
        </motion.div>
      ) : null}

      {/* ── Mobile: bottom sheet ── */}
      <motion.div
        {...sheetMotion}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        data-variant={variant}
        data-mobile-expanded={isMobileExpanded}
        className={[
          'overlay-mobile-sheet',
          'fixed bottom-0 left-0 right-0 z-30 flex max-h-[calc(100dvh-20px)] h-[calc(100dvh-20px)] flex-col overflow-y-auto rounded-t-clay bg-surface shadow-clay-lg md:hidden',
          isPillClosed ? 'max-md:hidden' : '',
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
                className="focus-ring flex h-11 w-full items-center justify-center border-0 bg-transparent p-0 touch-manipulation"
                style={{ touchAction: 'none' }}
                onPointerDown={handleDragStart}
                onClickCapture={swallowClickIfDragged}
                onClick={onMobileToggle}
                aria-label="Collapse panel"
                aria-expanded="true"
              >
                <DragHandle />
              </button>
            )}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
          </div>
          {!isMobileExpanded && collapsedContent ? (
            <div
              className="flex w-full flex-col items-center"
              style={{ touchAction: 'none' }}
              onPointerDown={handleDragStart}
              onClickCapture={swallowClickIfDragged}
            >
              {collapsedContent}
            </div>
          ) : null}
        </div>
      </motion.div>

      {/* ── Desktop: floating panel ── */}
      <motion.div
        {...panelMotion}
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
      </motion.div>
    </>
  );
}
