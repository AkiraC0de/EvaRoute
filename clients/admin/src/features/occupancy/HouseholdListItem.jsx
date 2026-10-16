import { LogOut } from "lucide-react";
import { checkInCode, formatCheckedInAt, splitMembers } from "./occupancyUtils";

/**
 * One checked-in household (a `FacilityStay` with its members): initials,
 * family name, Check-In ID ("0001", the per-facility ticket number), check-in
 * time, member chips and the check-out control.
 */
const HouseholdListItem = ({ stay, busy, onCheckOut }) => {
  const initials = stay.familyName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const { total, children, adults } = splitMembers(stay.members);
  const code = checkInCode(stay);

  return (
    <li className="rounded-clay-sm bg-surface px-2.5 py-2 shadow-clay-xs">
      <div className="flex min-h-8 items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-bold text-accent"
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-bold text-ink-soft">{stay.familyName}</p>
          <p className="text-[12px] font-semibold text-muted">
            {total} {total === 1 ? "member" : "members"} ({adults} adult{adults === 1 ? "" : "s"},{" "}
            {children} {children === 1 ? "child" : "children"}) · {formatCheckedInAt(stay.checkedInAt)}
          </p>
        </div>
        <span
          title={`Check-in ID ${code}`}
          className="shrink-0 font-black rounded-full bg-sunken px-2.5 py-1 font-mono text-[12px] tracking-[1px] text-ink-soft shadow-clay-inset"
        >
          {code}
        </span>
        <button
          type="button"
          aria-label={`Check out ${stay.familyName}`}
          disabled={busy}
          onClick={() => onCheckOut(stay)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-clay-sm bg-sunken text-muted shadow-clay-inset transition hover:bg-accent-soft hover:text-accent disabled:opacity-50"
        >
          <LogOut size={15} strokeWidth={1.7} />
        </button>
      </div>
      <ul className="mt-1 flex flex-wrap gap-1 pl-11">
        {stay.members.map((member) => (
          <li
            key={member.id}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium shadow-clay-inset ${
              member.ageGroup === "CHILD"
                ? "bg-warning-soft text-warning"
                : "bg-accent-soft text-accent"
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
