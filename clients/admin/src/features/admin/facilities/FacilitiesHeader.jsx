import { Plus } from "lucide-react";
import Button from "../../../components/ui/Button";

/** Facilities page header — title block + the primary action. */
const FacilitiesHeader = ({ onRegister }) => (
  <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-[20px] font-bold leading-tight text-ink">Facilities</h1>
      <p className="mt-1 text-[11px] text-muted">
        Register, edit and restore evacuation centers
      </p>
    </div>
    <Button onClick={onRegister} size="md">
      <Plus size={13} strokeWidth={2.2} className="mr-1" /> Register facility
    </Button>
  </header>
);

export default FacilitiesHeader;
