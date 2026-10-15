import { LogOut } from "lucide-react";

/**
 * One checked-in household row with its check-out control (demo: local state).
 */
const HouseholdListItem = ({ household, onCheckOut }) => {
  const initials = household.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const people = household.adults + household.children;

  return (
    <li className="flex min-h-12 items-center gap-3 rounded-xl bg-white px-2.5 py-2 shadow-[0_4px_10px_rgba(40,60,100,0.1)]">
      <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8edff] text-[9px] font-bold text-[#5269ef]">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-semibold text-[#35405e]">{household.name}</p>
        <p className="text-[8px] text-[#8290aa]">{people} {people === 1 ? "member" : "members"}</p>
      </div>
      <button
        type="button"
        aria-label={`Check out ${household.name}`}
        onClick={() => onCheckOut(household)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f3f5fa] text-[#7180a0] transition hover:bg-[#e8edff] hover:text-[#5269ef]"
      >
        <LogOut size={15} strokeWidth={1.7} />
      </button>
    </li>
  );
};

export default HouseholdListItem;
