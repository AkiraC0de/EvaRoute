import { useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import HouseholdListItem from "./HouseholdListItem";
import HouseholdSearch from "./HouseholdSearch";

/**
 * Checked-in households for one facility (real stay records), with lookup by
 * family name or Check-In ID. The stay endpoint returns the facility's full
 * active list (it is not paginated), so filtering happens over the complete
 * fetched set — never over "just what is visible".
 */
const HouseholdList = ({ stays, busy, onCheckOut }) => {
  const [searchInput, setSearchInput] = useState("");

  const needle = searchInput.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!needle) return stays;
    return stays.filter(
      (stay) =>
        stay.familyName.toLowerCase().includes(needle) ||
        String(stay.id).toLowerCase().includes(needle),
    );
  }, [stays, needle]);

  return (
    <Card className="h-100">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[12px] font-bold text-ink-soft">Checked in now</h2>
        <span className="shrink-0 rounded-full bg-sunken px-2.5 py-1 text-[8px] font-semibold text-muted shadow-clay-inset">
          {stays.length} household{stays.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mb-3">
        <HouseholdSearch
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          resultCount={matches.length}
        />
      </div>

      <ul className="max-h-60 space-y-2 overflow-y-auto pr-1">
        {matches.map((stay) => (
          <HouseholdListItem key={stay.id} stay={stay} busy={busy} onCheckOut={onCheckOut} />
        ))}
        {matches.length === 0 && (
          <li className="py-8 text-center text-[10px] text-muted">
            {needle
              ? `No households match “${searchInput.trim()}”. Try part of the family name or the check-in ID.`
              : "No households checked in."}
          </li>
        )}
      </ul>

      {needle && matches.length === 0 && (
        <button
          type="button"
          onClick={() => setSearchInput("")}
          className="mx-auto mt-3 block text-[9px] font-semibold text-accent transition hover:text-accent-strong"
        >
          Clear search
        </button>
      )}
    </Card>
  );
};

export default HouseholdList;
