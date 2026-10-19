import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ClipboardList, X } from "lucide-react";
import Card from "../../components/ui/Card";
import { FilterSearch } from "../../components/ui/FilterControls";
import HouseholdListItem from "./HouseholdListItem";
import PersonListItem from "./PersonListItem";
import {
  flattenMembers,
  memberMatchesSearch,
  stayMatchesSearch,
} from "./occupancyUtils";

/**
 * Check-ins for one facility — the former household list, now with two
 * toggleable views over the same stay data:
 *
 *   Household (default) — one card per stay; lookup by family name or
 *   Check-In ID ("0001"); the card carries the check-out control.
 *   Individual — one card per person (name, child/adult category, the
 *   household they belong to); lookup by person name, family name or
 *   Check-In ID, plus a category filter. Informational — check-out stays
 *   per household in the Household view.
 *
 * The stay endpoint returns the facility's full active list (not
 * paginated), so filtering happens over the complete fetched set — never
 * over "just what is visible". Switching views clears the search and the
 * category filter (the search matches different things per view).
 */
const MODES = [
  { key: "household", label: "Household" },
  { key: "individual", label: "Individual" },
];

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "ADULT", label: "Adults" },
  { value: "CHILD", label: "Children" },
];

/** Rows per page — both views (Household and Individual). */
const PAGE_SIZE = 10;

const CheckInsList = ({ stays, busy, onCheckOut }) => {
  const [mode, setMode] = useState("household");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const isHousehold = mode === "household";

  const households = useMemo(
    () => stays.filter((stay) => stayMatchesSearch(stay, searchInput)),
    [stays, searchInput],
  );

  const people = useMemo(() => {
    const rows = flattenMembers(stays).filter(
      (entry) => !category || entry.member.ageGroup === category,
    );
    return rows.filter((entry) => memberMatchesSearch(entry, searchInput));
  }, [stays, category, searchInput]);

  const rows = isHousehold ? households : people;
  const total = isHousehold ? stays.length : flattenMembers(stays).length;
  const needle = searchInput.trim();

  // Pagination: PAGE_SIZE rows per page. A shrinking list (e.g. after a
  // check-out) clamps to the last page instead of stranding the operator
  // on an empty one.
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Page buttons: all of them when few, otherwise a window around the
  // current page with gaps marked by "…".
  const pageNumbers = [];
  if (pageCount <= 7) {
    for (let n = 1; n <= pageCount; n += 1) pageNumbers.push(n);
  } else {
    pageNumbers.push(1);
    const start = Math.max(2, safePage - 1);
    const end = Math.min(pageCount - 1, safePage + 1);
    if (start > 2) pageNumbers.push("…");
    for (let n = start; n <= end; n += 1) pageNumbers.push(n);
    if (end < pageCount - 1) pageNumbers.push("…");
    pageNumbers.push(pageCount);
  }

  const switchMode = (next) => {
    setMode(next);
    setSearchInput("");
    setCategory("");
    setPage(1);
  };

  return (
    <Card className="flex h-full w-full min-h-80 flex-col">
      {/* Header: icon + titles, view toggle, count chip */}
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-clay-sm bg-accent-soft text-accent"
        >
          <ClipboardList size={15} strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[13px] font-bold text-ink-soft">Check-ins</h2>
          <p className="text-[10px] text-muted">
            {isHousehold
              ? "Households currently in this facility"
              : "Individuals currently in this facility"}
          </p>
        </div>

        <div
          role="group"
          aria-label="Check-in view"
          className="ml-auto flex shrink-0 items-center gap-1 rounded-clay-sm bg-sunken p-1 shadow-clay-inset"
        >
          {MODES.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={mode === item.key}
              onClick={() => switchMode(item.key)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                mode === item.key
                  ? "bg-accent text-white shadow-clay-xs"
                  : "text-muted hover:text-ink-soft"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <span className="shrink-0 rounded-full bg-sunken px-2.5 py-1 text-[10px] font-semibold text-muted shadow-clay-inset">
          {total} {isHousehold ? `household${total === 1 ? "" : "s"}` : `people`}
        </span>
      </div>

      {/* Toolbar: lookup + (individual only) category filter */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <FilterSearch
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setPage(1);
          }}
          placeholder={
            isHousehold
              ? "Search family name or check-in ID…"
              : "Search name, family or ID…"
          }
          ariaLabel={
            isHousehold
              ? "Search households by family name or check-in ID"
              : "Search people by name, family name or check-in ID"
          }
        />
        {!isHousehold && (
          <div
            role="group"
            aria-label="Filter by category"
            className="flex items-center gap-1 rounded-clay-sm bg-sunken p-1 shadow-clay-inset"
          >
            {CATEGORIES.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={category === item.value}
                onClick={() => {
                  setCategory(item.value);
                  setPage(1);
                }}
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                  category === item.value
                    ? "bg-surface text-ink-soft shadow-clay-xs"
                    : "text-muted hover:text-ink-soft"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
        {needle && (
          <>
            <span className="rounded-full bg-sunken px-2 py-0.5 text-[10px] font-semibold text-muted shadow-clay-inset">
              {rows.length} match{rows.length === 1 ? "" : "es"}
            </span>
            <button
              type="button"
              aria-label="Clear check-in search"
              onClick={() => {
                setSearchInput("");
                setPage(1);
              }}
              className="inline-flex h-9 items-center gap-1 rounded-clay-sm bg-sunken px-2.5 text-[11px] font-semibold text-muted shadow-clay-inset transition hover:text-ink-soft"
            >
              <X size={11} strokeWidth={2} /> Clear
            </button>
          </>
        )}
      </div>

      {/* Rows — one page at a time */}
      <ul className="flex-1 space-y-2">
        {isHousehold
          ? pageRows.map((stay) => (
              <HouseholdListItem
                key={stay.id}
                stay={stay}
                busy={busy}
                onCheckOut={onCheckOut}
              />
            ))
          : pageRows.map((entry) => (
              <PersonListItem key={`${entry.stay.id}-${entry.member.id}`} entry={entry} />
            ))}
        {rows.length === 0 && (
          <li className="py-8 text-center text-[12px] text-muted">
            {needle || (!isHousehold && category)
              ? isHousehold
                ? `No households match “${needle}”. Try part of the family name or the check-in ID.`
                : `No ${category === "CHILD" ? "children" : category === "ADULT" ? "adults" : "people"}${
                    needle ? ` match “${needle}”` : " found"
                  }. Try part of a name, the family name or the check-in ID.`
              : isHousehold
                ? "No households checked in."
                : "No individuals checked in."}
          </li>
        )}
      </ul>

      {/* Pager — hidden when everything fits on one page */}
      {pageCount > 1 && (
        <nav
          aria-label="Check-ins pagination"
          className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3"
        >
          <button
            type="button"
            aria-label="Previous page"
            disabled={safePage === 1}
            onClick={() => setPage(safePage - 1)}
            className="flex h-10 w-10 items-center justify-center rounded-clay-sm bg-sunken text-muted shadow-clay-inset transition hover:text-ink-soft disabled:opacity-40"
          >
            <ChevronLeft size={15} strokeWidth={2} />
          </button>
          <div className="flex items-center gap-1">
            {pageNumbers.map((n, index) =>
              typeof n === "number" ? (
                <button
                  key={n}
                  type="button"
                  aria-label={`Page ${n}`}
                  aria-current={n === safePage ? "page" : undefined}
                  onClick={() => setPage(n)}
                  className={`min-w-9 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition ${
                    n === safePage
                      ? "bg-accent text-white shadow-clay-xs"
                      : "bg-sunken text-muted shadow-clay-inset hover:text-ink-soft"
                  }`}
                >
                  {n}
                </button>
              ) : (
                <span key={`gap-${index}`} className="px-1 text-[11px] text-muted-dim">
                  {n}
                </span>
              ),
            )}
          </div>
          <button
            type="button"
            aria-label="Next page"
            disabled={safePage === pageCount}
            onClick={() => setPage(safePage + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-clay-sm bg-sunken text-muted shadow-clay-inset transition hover:text-ink-soft disabled:opacity-40"
          >
            <ChevronRight size={15} strokeWidth={2} />
          </button>
        </nav>
      )}
    </Card>
  );
};

export default CheckInsList;
