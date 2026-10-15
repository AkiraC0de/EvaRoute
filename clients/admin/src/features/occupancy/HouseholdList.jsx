import Card from "../../components/ui/Card";
import HouseholdListItem from "./HouseholdListItem";

/**
 * Checked-in households for one facility (real stay records).
 */
const HouseholdList = ({ stays, busy, onCheckOut }) => (
  <Card>
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-[12px] font-bold text-ink-soft">Checked in now</h2>
      <span className="shrink-0 rounded-full bg-sunken px-2.5 py-1 text-[8px] font-semibold text-muted shadow-clay-inset">
        {stays.length} households
      </span>
    </div>
    <ul className="max-h-47.5 space-y-2 overflow-y-auto pr-1">
      {stays.map((stay) => (
        <HouseholdListItem key={stay.id} stay={stay} busy={busy} onCheckOut={onCheckOut} />
      ))}
      {stays.length === 0 && (
        <li className="py-8 text-center text-[10px] text-muted">No households checked in.</li>
      )}
    </ul>
  </Card>
);

export default HouseholdList;
