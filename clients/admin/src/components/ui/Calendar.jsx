import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

/**
 * Calendar built on react-day-picker (shadcn's calendar base), themed with
 * the clay tokens. Supports single or range selection via `mode`.
 */
const Calendar = ({ mode = "single", selected, onSelect, className = "", ...props }) => (
  <DayPicker
    mode={mode}
    selected={selected}
    onSelect={onSelect}
    showOutsideDays
    className={`rounded-clay bg-surface p-2 text-ink ${className}`}
    classNames={{
      months: "flex gap-3",
      month: "space-y-2",
      month_caption: "flex h-8 items-center justify-center text-[11px] font-bold text-ink",
      caption_label: "text-[11px] font-bold text-ink",
      nav: "flex items-center justify-between gap-1",
      button_previous:
        "flex h-7 w-7 items-center justify-center rounded-clay-sm text-muted transition hover:bg-sunken hover:text-ink",
      button_next:
        "flex h-7 w-7 items-center justify-center rounded-clay-sm text-muted transition hover:bg-sunken hover:text-ink",
      chevron: "fill-none stroke-current",
      month_grid: "w-full border-collapse",
      weekdays: "flex",
      weekday: "w-8 py-1 text-center text-[8px] font-semibold uppercase text-muted",
      weeks: "flex flex-col gap-0.5",
      week: "flex",
      day: "relative flex h-8 w-8 items-center justify-center",
      day_button:
        "flex h-8 w-8 items-center justify-center rounded-clay-sm text-[10px] font-medium text-ink-soft outline-none transition hover:bg-sunken data-[focused]:ring-2 data-[focused]:ring-accent",
      selected: "bg-transparent data-[selected]:text-white",
      range_start: "rounded-clay-sm bg-accent text-white",
      range_middle: "rounded-none bg-accent-soft text-accent-strong",
      range_end: "rounded-clay-sm bg-accent text-white",
      today: "font-bold text-accent",
      outside: "text-muted-dim opacity-60",
      disabled: "cursor-not-allowed opacity-40",
    }}
    {...props}
  />
);

export default Calendar;
