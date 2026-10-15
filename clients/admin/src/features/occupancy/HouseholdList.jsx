import HouseholdListItem from "./HouseholdListItem";

/**
 * Checked-in households list (demo: local state).
 */
const HouseholdList = ({ households, onCheckOut }) => (
  <section className="rounded-[18px] bg-white p-4 shadow-[0_8px_20px_rgba(40,60,100,0.08)]">
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-[12px] font-bold text-[#35405e]">Checked in today</h2>
      <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[8px] font-semibold text-[#7180a0] shadow-[0_3px_10px_rgba(40,60,100,0.1)]">
        {households.length} households
      </span>
    </div>
    <ul className="max-h-47.5 space-y-2 overflow-y-auto pr-1">
      {households.map((household) => (
        <HouseholdListItem key={household.id} household={household} onCheckOut={onCheckOut} />
      ))}
      {households.length === 0 && (
        <li className="py-8 text-center text-[10px] text-[#8290aa]">No households checked in today.</li>
      )}
    </ul>
  </section>
);

export default HouseholdList;
