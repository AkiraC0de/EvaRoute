import EmptyArt from "../../../components/ui/EmptyArt";
import SectionCard from "./SectionCard";

/**
 * Check-in pulse — the shadcn-style contribution grid: five weeks of days,
 * intensity = that day's check-ins (relative to the busiest day), hover for
 * the exact count. It answers "when do families arrive?" — a pattern read
 * the 14-day bar chart can't give at a glance, so the two views are
 * complementary (intensity pattern vs. exact daily values). The grid is
 * aria-labelled and each cell carries its own text alternative; intensity is
 * never color-only (the tooltip text states the count).
 *
 * Data: the same day-bucketed /activity/stats series the chart uses, widened
 * to the endpoint's 31-day window — one request feeds both.
 */
const LEVELS = [
  "bg-surface-2",
  "bg-primary/20",
  "bg-primary/45",
  "bg-primary/75",
  "bg-primary",
];

const levelOf = (count, max) => {
  if (!(count > 0) || !(max > 0)) return 0;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
};

const WEEKDAYS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

const ActivityHeatmapCard = ({ timeline, loading }) => {
  // Build the day grid: columns = weeks (Monday-anchored), rows = weekdays.
  const days = (timeline ?? []).map((bucket) => {
    const date = new Date(`${bucket.date}T00:00:00Z`);
    return {
      key: bucket.date,
      count: bucket.checkIns ?? 0,
      // Monday-first weekday index (0 = Mon … 6 = Sun).
      weekday: (date.getUTCDay() + 6) % 7,
      label: date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
    };
  });
  const max = days.reduce((peak, day) => Math.max(peak, day.count), 0);
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const busiest = days.reduce(
    (peak, day) => (day.count > (peak?.count ?? -1) ? day : peak),
    null
  );

  // Leading blanks so the first day lands on its weekday row.
  const leading = days.length > 0 ? days[0].weekday : 0;
  const cells = [
    ...Array.from({ length: leading }, (_, i) => ({ key: `blank-${i}`, blank: true })),
    ...days,
  ];

  return (
    <SectionCard
      title="Check-in pulse"
      meta="Daily check-in intensity over the last 5 weeks — darker means busier."
    >
      {loading && (
        <div role="status" aria-label="Loading check-in pulse" className="flex gap-1.5 overflow-hidden">
          {Array.from({ length: 35 }, (_, n) => (
            <span key={n} className="h-3 w-3 rounded-[2px] bg-surface-2" />
          ))}
        </div>
      )}

      {!loading && timeline && days.length > 0 && (
        <>
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2">
              {/* Weekday axis */}
              <div className="grid grid-rows-7 gap-[3px] pr-1">
                {WEEKDAYS.map((day, i) => (
                  <span key={i} className="flex h-3 items-center text-[8px] font-semibold text-muted-dim">
                    {day}
                  </span>
                ))}
              </div>
              {/* The grid: columns flow by week */}
              <div
                role="img"
                aria-label={`Check-in intensity grid: ${total} check-ins across ${days.length} days`}
                className="grid grid-flow-col grid-rows-7 gap-[3px]"
              >
                {cells.map((cell) =>
                  cell.blank ? (
                    <span key={cell.key} className="h-3 w-3" />
                  ) : (
                    <span
                      key={cell.key}
                      title={`${cell.count} check-in${cell.count === 1 ? "" : "s"} · ${cell.label}`}
                      className={`h-3 w-3 rounded-[2px] ${LEVELS[levelOf(cell.count, max)]}`}
                    />
                  )
                )}
              </div>
            </div>
          </div>

          {/* Legend + the one derived callout (busiest day lives here only). */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-semibold text-muted-dim">Less</span>
              {LEVELS.map((level) => (
                <span key={level} className={`h-2.5 w-2.5 rounded-[2px] ${level}`} />
              ))}
              <span className="text-[9px] font-semibold text-muted-dim">More</span>
            </div>
            {busiest && busiest.count > 0 ? (
              <p className="text-[10px] text-muted">
                Busiest:{" "}
                <span className="font-semibold text-ink-soft">
                  {busiest.label} · {busiest.count} check-ins
                </span>
              </p>
            ) : (
              <p className="text-[10px] text-muted">{total} check-ins in the window</p>
            )}
          </div>
        </>
      )}

      {!loading && (!timeline || days.length === 0) && (
        <div className="py-10 text-center">
          <EmptyArt variant="people" className="mx-auto h-16 w-28" />
          <p className="mt-2 text-[12px] text-muted">
            No check-in history yet — the pulse fills in as families arrive.
          </p>
        </div>
      )}
    </SectionCard>
  );
};

export default ActivityHeatmapCard;
