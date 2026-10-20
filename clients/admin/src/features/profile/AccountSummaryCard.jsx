import { displayNameOf, roleLabelOf } from "../../lib/user";
import Card from "../../components/ui/Card";
import StatusPill from "../../components/ui/StatusPill";

/**
 * Account summary card: the identity block (name, email, role badge).
 * Facility/role details live in the Account information panel below — one
 * source per fact (the theme audit's duplication fix).
 */
const AccountSummaryCard = ({ user }) => {
  const fullName = displayNameOf(user);

  return (
    <Card as="section" aria-label="Staff account summary" pad="px-4 py-4" className="mb-4">
      <h2 className="text-[15px] font-bold text-ink">{fullName}</h2>
      <p className="text-[11px] text-muted">{user?.email || "—"}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <StatusPill tone="primary">{roleLabelOf(user?.role)}</StatusPill>
      </div>
    </Card>
  );
};

export default AccountSummaryCard;
