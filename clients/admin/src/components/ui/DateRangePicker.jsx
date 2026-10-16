import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { CalendarDays } from "lucide-react";
import Calendar from "./Calendar";

/**
 * Date-range picker (popover + range calendar) for the History filter band,
 * replacing the two native date inputs.
 *
 * Value contract matches the old FilterDate inputs: `from`/`to` are
 * "YYYY-MM-DD" strings ("" when unset); onChange({ from, to }).
 */
const pad = (n) => String(n).padStart(2, "0");
const toISO = (date) =>
  date
    ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    : "";
const fromISO = (value) => {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const human = (value) => {
  const date = fromISO(value);
  return date ? `${MONTHS[date.getMonth()]} ${date.getDate()}` : "—";
};

const DateRangePicker = ({
  from,
  to,
  onChange,
  label = "Dates",
  ariaLabel = "Pick a date range",
}) => {
  const [open, setOpen] = useState(false);
  const range = { from: fromISO(from), to: fromISO(to) };
  const hasRange = Boolean(range.from || range.to);

  const handleSelect = (next) => {
    onChange?.({ from: toISO(next?.from), to: toISO(next?.to) });
  };

  return (
    <label className="flex items-center gap-1.5">
      <span className="text-[11px] font-medium text-[#65718c]">{label}</span>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          aria-label={ariaLabel}
          className={`inline-flex h-9 items-center gap-2 rounded-clay-sm bg-sunken px-3 text-[12px] font-medium text-ink-soft shadow-clay-inset outline-none transition hover:bg-[#f2f5fb] ring-accent focus:ring-2 ${
            hasRange ? "" : "text-muted-dim"
          }`}
        >
          <CalendarDays size={12} strokeWidth={2} className="text-muted" />
          {hasRange ? `${human(from)} – ${human(to)}` : "All dates"}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={4}
            align="start"
            className="z-[70] rounded-clay bg-surface shadow-clay-lg"
          >
            <Calendar
              mode="range"
              selected={range.from ? range : undefined}
              onSelect={handleSelect}
              numberOfMonths={1}
            />
            <div className="flex items-center justify-between gap-2 border-t border-line px-2.5 py-2">
              <button
                type="button"
                onClick={() => {
                  onChange?.({ from: "", to: "" });
                  setOpen(false);
                }}
                className="rounded-clay-sm px-2 py-1 text-[11px] font-semibold text-muted transition hover:bg-sunken hover:text-ink-soft"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-clay-sm bg-accent px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-accent-strong"
              >
                Done
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </label>
  );
};

export default DateRangePicker;
