import { Plus } from "../../../components/icons/evaIcons";
import Button from "../../../components/ui/Button";

/**
 * Page header — teal people icon chip + title/blurb, the live count chip and
 * the create-staff entry point.
 */
const StaffHeader = ({ onCreate, count }) => (
  <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
    <div className="flex items-center gap-3">
      <div>
        <h1 className="flex items-center gap-2 text-[22px] font-bold leading-tight text-ink">
          Staff accounts
          {typeof count === "number" && (
            <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-semibold text-muted">
              {count} account{count === 1 ? "" : "s"}
            </span>
          )}
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          Create and manage the accounts that run your facilities
        </p>
      </div>
    </div>
    <Button onClick={onCreate}>
      <Plus size={13} strokeWidth={2.2} className="mr-1" /> Create staff account
    </Button>
  </header>
);

export default StaffHeader;
