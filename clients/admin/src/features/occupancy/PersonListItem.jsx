import { checkInCode, formatCheckedInAt } from "./occupancyUtils";

/**
 * One person in the Individual view of Check-ins: name + category chip
 * (child / adult) and the household they belong to (family name, Check-In
 * ID and check-in time). Informational card — check-out is per household
 * and lives in the Household view. Same flat row + people (teal) chip
 * grammar as HouseholdListItem: filled chip for children, outlined for
 * adults; the label always spells the category.
 */
const PersonListItem = ({ entry }) => {
  const { member, stay } = entry;
  const isChild = member.ageGroup === "CHILD";
  const initials =
    member.fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?";
  const code = checkInCode(stay);

  return (
    <li className="rounded-md border border-line bg-surface px-3 py-2.5 transition-colors hover:bg-surface-2">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-[11px] font-bold text-secondary-ink"
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-[13px] font-bold text-ink">{member.fullName}</p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                isChild
                  ? "bg-secondary-soft text-secondary-ink"
                  : "border border-secondary/20 text-secondary-ink"
              }`}
            >
              {isChild ? "Child" : "Adult"}
            </span>
          </div>
          <p className="mt-1 truncate text-[11px] text-muted">
            {stay.familyName} household · Check-in ID{" "}
            <span className="font-mono font-semibold text-ink-soft">{code}</span> · checked in{" "}
            {formatCheckedInAt(stay.checkedInAt)}
          </p>
        </div>
      </div>
    </li>
  );
};

export default PersonListItem;
