import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { CalendarDays, ChevronDown } from "lucide-react";
import Button from "./Button";
import Calendar from "./Calendar";
import { CONTROL_CLASS } from "./FilterControls";

/**
 * Date-range picker (popover + range calendar) for the History filter band,
 * replacing the two native date inputs. Optional `presets` ({ label, from,
 * to }) render as quick chips above the calendar so the filter band never
 * needs its own preset buttons.
 *
 * Value contract matches the old FilterDate inputs: `from`/`to` are
 * "YYYY-MM-DD" strings ("" when unset); onChange({ from, to }) — presets
 * apply through the same callback.
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
  presets = [],
}) => {
  const [open, setOpen] = useState(false);
  const range = { from: fromISO(from), to: fromISO(to) };
  const hasRange = Boolean(range.from || range.to);

  const handleSelect = (next) => {
    onChange?.({ from: toISO(next?.from), to: toISO(next?.to) });
  };

  return (
    <label className="flex items-center gap-1.5">
      <span className="text-[11px] font-medium text-muted">{label}</span>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          aria-label={ariaLabel}
          className={`inline-flex items-center gap-2 shadow-none hover:bg-surface-2-hover ${CONTROL_CLASS} ${
            hasRange ? "" : "text-muted-dim"
          }`}
        >
          <CalendarDays size={12} strokeWidth={2} className="text-muted" />
          {hasRange ? `${human(from)} – ${human(to)}` : "All dates"}
          <ChevronDown size={12} strokeWidth={2} className="text-muted-dim" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={4}
            align="start"
            /* Focus stays on the trigger: auto-focus landed on the first
               preset chip and its ring read as a second "selected" preset. */
            onOpenAutoFocus={(event) => event.preventDefault()}
            className="z-[70] rounded-lg bg-surface shadow-md"
          >
            {presets.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 border-b border-line px-2.5 py-2">
                {presets.map((preset) => {
                  const active =
                    preset.from === (from ?? "") && preset.to === (to ?? "");
                  return (
                    <Button
                      key={preset.label}
                      size="sm"
                      variant={active ? "soft" : "neutral"}
                      aria-pressed={active}
                      onClick={() => {
                        onChange?.({ from: preset.from, to: preset.to });
                        setOpen(false);
                      }}
                    >
                      {preset.label}
                    </Button>
                  );
                })}
              </div>
            )}
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
                className="rounded-md px-2 py-1 text-[11px] font-semibold text-muted transition hover:bg-surface-2 hover:text-ink-soft"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-primary-strong"
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
