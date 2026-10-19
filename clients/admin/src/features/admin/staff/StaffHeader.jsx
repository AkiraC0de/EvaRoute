import { Plus, SquareUser } from "lucide-react";
import Button from "../../../components/ui/Button";

/**
 * Page header — icon chip + title/blurb, the live count chip and the
 * create-staff entry point (occupancy header pattern).
 */
const StaffHeader = ({ onCreate, count }) => (
  <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-clay-sm bg-accent-soft text-accent"
      >
        <SquareUser size={18} strokeWidth={1.9} />
      </span>
      <div>
        <h1 className="flex items-center gap-2 text-[22px] font-bold leading-tight text-ink">
          Staff accounts
          {typeof count === "number" && (
            <span className="rounded-full bg-sunken px-2.5 py-1 text-[10px] font-semibold text-muted shadow-clay-inset">
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
