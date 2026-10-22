import { Plus } from "../../../components/icons/evaIcons";
import Button from "../../../components/ui/Button";

/** Facilities page header — title block + the primary action. */
const FacilitiesHeader = ({ onRegister, children }) => (
  <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-[22px] font-bold leading-tight text-ink">Facilities</h1>
      <p className="mt-1 text-[13px] text-muted">
        Register, edit and restore evacuation centers
      </p>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      {children}
      <Button onClick={onRegister} size="md">
        <Plus size={13} strokeWidth={2.2} className="mr-1" /> Register facility
      </Button>
    </div>
  </header>
);

export default FacilitiesHeader;
