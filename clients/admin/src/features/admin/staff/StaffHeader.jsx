import { Plus } from "lucide-react";
import Button from "../../../components/ui/Button";

/** Page header — title, blurb and the create-staff entry point. */
const StaffHeader = ({ onCreate }) => (
  <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-[22px] font-bold leading-tight text-ink">Staff accounts</h1>
      <p className="mt-1 text-[13px] text-muted">
        Create and manage the accounts that run your facilities
      </p>
    </div>
    <Button onClick={onCreate}>
      <Plus size={13} strokeWidth={2.2} className="mr-1" /> Create staff account
    </Button>
  </header>
);

export default StaffHeader;
