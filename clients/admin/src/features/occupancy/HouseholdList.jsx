import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import Card from "../../components/ui/Card";
import HouseholdListItem from "./HouseholdListItem";
import HouseholdSearch from "./HouseholdSearch";
import { stayMatchesSearch } from "./occupancyUtils";

/**
 * Checked-in households for one facility (real stay records), with lookup by
 * family name or Check-In ID ("0001"). The stay endpoint returns the
 * facility's full active list (it is not paginated), so filtering happens over
 * the complete fetched set — never over "just what is visible".
 */
const HouseholdList = ({ stays, busy, onCheckOut }) => {
  const [searchInput, setSearchInput] = useState("");

  const matches = useMemo(
    () => stays.filter((stay) => stayMatchesSearch(stay, searchInput)),
    [stays, searchInput],
  );
  const needle = searchInput.trim();

  return (
    <Card className="flex h-full w-full min-h-80 flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-clay-sm bg-accent-soft text-accent"
        >
          <Users size={15} strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[13px] font-bold text-ink-soft">Checked in now</h2>
          <p className="text-[10px] text-muted">Households currently in this facility</p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-sunken px-2.5 py-1 text-[10px] font-semibold text-muted shadow-clay-inset">
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

      <ul className="max-h-[420px] flex-1 space-y-2 overflow-y-auto pr-1 lg:max-h-none">
        {matches.map((stay) => (
          <HouseholdListItem key={stay.id} stay={stay} busy={busy} onCheckOut={onCheckOut} />
        ))}
        {matches.length === 0 && (
          <li className="py-8 text-center text-[12px] text-muted">
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
          className="mx-auto mt-3 block text-[11px] font-semibold text-accent transition hover:text-accent-strong"
        >
          Clear search
        </button>
      )}
    </Card>
  );
};

export default HouseholdList;
