import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, ClipboardList, X } from "lucide-react";
import Card from "../../components/ui/Card";
import { slideVariants } from "../../components/ui/slideVariants";
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
  // Slide direction for the view switch: +1 Household -> Individual (content
  // enters from the right), -1 the other way. Set in the handler, read at
  // render — never written during render.
  const [dir, setDir] = useState(1);
  const reduceMotion = useReducedMotion();
  // Directional slide (view toggle AND pagination) — shared vocabulary with
  // the activity feed; `custom` carries the direction of travel.
  const listVariants = useMemo(() => slideVariants(reduceMotion), [reduceMotion]);
  // Sliding active pills (the app's one active-state language — same grammar
  // as the nav rails). Per-instance ids so sibling toggles never share one.
  const modePillId = `checkins-mode-pill-${useId()}`;
  const categoryPillId = `checkins-category-pill-${useId()}`;
  const pillTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 480, damping: 40, mass: 0.85 };
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

  // Page travel: the next page slides in from the right, the previous page
  // from the left. One direction flag feeds the shared variants via `custom`.
  const goToPage = (next) => {
    const target = Math.max(1, next);
    if (target === safePage) return;
    setDir(target > safePage ? 1 : -1);
    setPage(target);
  };

  const switchMode = (next) => {
    if (next === mode) return;
    const order = MODES.map((item) => item.key);
    setDir(order.indexOf(next) > order.indexOf(mode) ? 1 : -1);
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
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-ink"
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
          className="ml-auto flex shrink-0 items-center gap-1 rounded-md bg-surface-2 p-1"
        >
          {MODES.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={mode === item.key}
              onClick={() => switchMode(item.key)}
              className={`relative rounded-full px-2.5 py-1 text-[10px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink ${
                mode === item.key ? "text-white" : "text-muted hover:text-ink-soft"
              }`}
            >
              {mode === item.key && (
                <motion.span
                  layoutId={modePillId}
                  aria-hidden="true"
                  transition={pillTransition}
                  className="absolute inset-0 rounded-full bg-primary"
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </div>

        <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-semibold text-muted">
          {total} {isHousehold ? `household${total === 1 ? "" : "s"}` : `people`}
        </span>
      </div>

      {/* Toolbar: lookup + (individual only) category filter */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <FilterSearch
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            goToPage(1);
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
            className="flex items-center gap-1 rounded-md bg-surface-2 p-1"
          >
            {CATEGORIES.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={category === item.value}
                onClick={() => {
                  setCategory(item.value);
                  goToPage(1);
                }}
                className={`relative rounded-full px-2.5 py-1 text-[10px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink ${
                  category === item.value ? "text-ink-soft" : "text-muted hover:text-ink-soft"
                }`}
              >
                {category === item.value && (
                  <motion.span
                    layoutId={categoryPillId}
                    aria-hidden="true"
                    transition={pillTransition}
                    className="absolute inset-0 rounded-full bg-surface"
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </div>
        )}
        {needle && (
          <>
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted">
              {rows.length} match{rows.length === 1 ? "" : "es"}
            </span>
            <button
              type="button"
              aria-label="Clear check-in search"
              title="Clear check-in search"
              onClick={() => {
                setSearchInput("");
                goToPage(1);
              }}
              className="inline-flex h-9 items-center gap-1 rounded-md bg-surface-2 px-2.5 text-[11px] font-semibold text-muted transition hover:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
            >
              <X size={11} strokeWidth={2} /> Clear
            </button>
          </>
        )}
      </div>

      {/* Rows — one page at a time. The panel slides toward the selected
          view (exit faster than enter); under reduced motion it is an
          instant fade. The wrapper keeps the card's flex space while
          AnimatePresence swaps the panels. */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.ul
            key={`${mode}-${safePage}`}
            custom={dir}
            variants={listVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-2"
          >
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
          </motion.ul>
        </AnimatePresence>
      </div>

      {/* Pager — hidden when everything fits on one page */}
      {pageCount > 1 && (
        <nav
          aria-label="Check-ins pagination"
          className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3"
        >
          <button
            type="button"
            aria-label="Previous page"
            title="Previous page"
            disabled={safePage === 1}
            onClick={() => goToPage(safePage - 1)}
            className="flex h-11 w-11 items-center justify-center rounded-md bg-surface-2 text-muted transition hover:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink disabled:opacity-40 sm:h-10 sm:w-10"
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
                  onClick={() => goToPage(n)}
                  className={`min-w-9 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink ${
                    n === safePage
                      ? "bg-primary text-white"
                      : "bg-surface-2 text-muted hover:text-ink-soft"
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
            title="Next page"
            disabled={safePage === pageCount}
            onClick={() => goToPage(safePage + 1)}
            className="flex h-11 w-11 items-center justify-center rounded-md bg-surface-2 text-muted transition hover:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink disabled:opacity-40 sm:h-10 sm:w-10"
          >
            <ChevronRight size={15} strokeWidth={2} />
          </button>
        </nav>
      )}
    </Card>
  );
};

export default CheckInsList;
