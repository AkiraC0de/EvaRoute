import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Activity timeline chart (recharts — shadcn Chart's base library), themed
 * with the design tokens: navy bars for check-ins over a neutral underlay of
 * other events, dashed gridlines, tiny tracked axis labels. `data` is the
 * server's zero-filled per-day timeline:
 *   [{ date: "YYYY-MM-DD", total, checkIns, checkOuts }]
 */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload ?? {};
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 shadow-sm">
      <p className="text-[11px] font-semibold text-ink">{label}</p>
      <p className="mt-1 text-[11px] text-muted">
        <span className="font-semibold text-primary-ink">{row.checkIns ?? 0}</span> check-ins ·{" "}
        <span className="font-semibold text-ink-soft">{row.total ?? 0}</span> events
      </p>
    </div>
  );
};

const ActivityChart = ({ data = [], height = 220 }) => {
  const chartData = data.map((bucket) => ({
    ...bucket,
    label: new Date(`${bucket.date}T00:00:00Z`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }),
    other: Math.max((bucket.total ?? 0) - (bucket.checkIns ?? 0), 0),
  }));

  /* Value labels above the bars for sparse-data legibility: quiet days stay
     unlabeled, busy days show their total. Recharts skips label entries on
     zero-height segments, so each stacked segment labels only the days it
     tops — the check-ins segment when there are check-ins, else the
     other-events segment (its entry is the whole bar on those days). */
  const dayLabel = (topSegment) => ({ x, y, width, value, index }) => {
    const row = chartData[index] ?? {};
    const checkIns = row.checkIns ?? 0;
    const isTop = topSegment === "checkIns" ? checkIns > 0 : checkIns === 0;
    if (!(value > 0 && isTop)) return null;
    return (
      <text
        x={x + width / 2}
        y={y - 4}
        textAnchor="middle"
        fontSize={8}
        fontWeight={600}
        fill="var(--color-muted)"
      >
        {value}
      </text>
    );
  };

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 16, right: 8, bottom: 0, left: -24 }}>
          <CartesianGrid
            stroke="var(--color-line)"
            strokeDasharray="3 4"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--color-muted-dim)", fontSize: 8, fontWeight: 600 }}
            tickLine={false}
            axisLine={{ stroke: "var(--color-line)" }}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "var(--color-muted-dim)", fontSize: 8, fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "var(--color-surface-2)", opacity: 0.7 }}
          />
          {/* Stacked: other events underlay (neutral), check-ins on top (primary). */}
          <Bar dataKey="other" stackId="day" fill="var(--color-line-strong)" radius={[0, 0, 6, 6]}>
            <LabelList dataKey="total" position="top" content={dayLabel("other")} />
          </Bar>
          <Bar dataKey="checkIns" stackId="day" radius={[6, 6, 0, 0]}>
            <LabelList dataKey="total" position="top" content={dayLabel("checkIns")} />
            {chartData.map((entry) => (
              <Cell key={entry.date} fill="var(--color-primary)" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
