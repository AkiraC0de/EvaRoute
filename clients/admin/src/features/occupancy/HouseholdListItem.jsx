import { LogOut } from "lucide-react";

/**
 * One checked-in household (a `FacilityStay` with its members) and its
 * check-out control.
 */
const HouseholdListItem = ({ stay, busy, onCheckOut }) => {
  const initials = stay.familyName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const people = stay.members.length;

  return (
    <li className="rounded-xl bg-white px-2.5 py-2 shadow-[0_4px_10px_rgba(40,60,100,0.1)]">
      <div className="flex min-h-8 items-center gap-3">
        <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8edff] text-[9px] font-bold text-[#5269ef]">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold text-[#35405e]">{stay.familyName}</p>
          <p className="text-[8px] text-[#8290aa]">
            {people} {people === 1 ? "member" : "members"} · checked in{" "}
            {new Date(stay.checkedInAt).toLocaleString()}
          </p>
        </div>
        <button
          type="button"
          aria-label={`Check out ${stay.familyName}`}
          disabled={busy}
          onClick={() => onCheckOut(stay)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f3f5fa] text-[#7180a0] transition hover:bg-[#e8edff] hover:text-[#5269ef] disabled:opacity-50"
        >
          <LogOut size={15} strokeWidth={1.7} />
        </button>
      </div>
      <ul className="mt-1 flex flex-wrap gap-1 pl-11">
        {stay.members.map((member) => (
          <li
            key={member.id}
            className={`rounded-full px-2 py-0.5 text-[8px] font-medium ${
              member.ageGroup === "CHILD"
                ? "bg-[#fff3d9] text-[#a96a00]"
                : "bg-[#e8edff] text-[#5269ef]"
            }`}
          >
            {member.fullName} · {member.ageGroup === "CHILD" ? "Child" : "Adult"}
          </li>
        ))}
      </ul>
    </li>
  );
};

export default HouseholdListItem;
