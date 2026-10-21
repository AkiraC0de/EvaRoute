import Card from "../../components/ui/Card";
import StatusPill from "../../components/ui/StatusPill";
import { displayNameOf, initialsOf, roleLabelOf } from "../../lib/user";

/**
 * Identity band: initials tile, name, email, role badge — the account's
 * headline block. Facility and name fields live in the Account information
 * card below — one source per fact (the theme audit's duplication fix).
 */
const AccountSummaryCard = ({ user }) => {
  const fullName = displayNameOf(user);

  return (
    <Card
      as="section"
      aria-label="Account summary"
      pad="p-4 sm:p-5"
      className="mb-5"
    >
      <div className="flex flex-wrap items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-[18px] font-bold text-primary-strong"
        >
          {initialsOf(user)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-bold leading-tight text-ink text-balance">
            {fullName}
          </h2>
          <p className="mt-0.5 truncate text-[12px] text-muted" title={user?.email || ""}>
            {user?.email || "—"}
          </p>
        </div>
        <StatusPill tone="primary">{roleLabelOf(user?.role)}</StatusPill>
      </div>
    </Card>
  );
};

export default AccountSummaryCard;
