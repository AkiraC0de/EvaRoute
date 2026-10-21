import { LogOut } from "lucide-react";
import CopyId from "../../components/ui/CopyId";
import FamilySilhouette from "./FamilySilhouette";
import { checkInCode, formatCheckedInAt, splitMembers } from "./occupancyUtils";

/**
 * One checked-in household (a `FacilityStay` with its members): initials,
 * family name, Check-In ID ("0001", the per-facility ticket number), check-in
 * time, member chips and the check-out control.
 *
 * Flat rows: hairline border + surface fill, no elevation. People chips
 * carry the people (teal) category tint — filled for children, outlined for
 * adults — and every chip spells its meaning in words, never color alone.
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
    <li className="relative overflow-hidden rounded-md border border-line bg-surface px-3 py-2.5 transition-colors hover:bg-surface-2">
      {/* Member-composition art — one figure per member, gray, behind the
          content in the lower-right so the category mix reads at a glance. */}
      <FamilySilhouette
        adults={adults}
        children={children}
        className="absolute bottom-0 right-2 h-[40px] w-auto max-w-[46%] text-muted opacity-15"
      />
      <div className="relative z-10 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-[11px] font-bold text-secondary-ink"
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-[13px] font-bold text-ink">{stay.familyName}</p>
            <CopyId
              value={code}
              label="Check-in ID"
              className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-bold tracking-[1px] text-ink-soft"
            />
          </div>
          <p className="mt-1 text-[11px] text-muted">
            {total} {total === 1 ? "member" : "members"} ({adults} adult{adults === 1 ? "" : "s"},{" "}
            {children} {children === 1 ? "child" : "children"}) · checked in{" "}
            {formatCheckedInAt(stay.checkedInAt)}
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1">
            {stay.members.map((member) => (
              <li
                key={member.id}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  member.ageGroup === "CHILD"
                    ? "bg-secondary-soft text-secondary-ink"
                    : "border border-secondary/20 text-secondary-ink"
                }`}
              >
                {member.fullName} · {member.ageGroup === "CHILD" ? "Child" : "Adult"}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          aria-label={`Check out ${stay.familyName}`}
          title={`Check out ${stay.familyName}`}
          disabled={busy}
          onClick={() => onCheckOut(stay)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface-2 text-muted transition hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink disabled:opacity-50 sm:h-10 sm:w-10"
        >
          <LogOut size={15} strokeWidth={1.7} />
        </button>
      </div>
    </li>
  );
};

export default HouseholdListItem;
