import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Trash2, RotateCcw } from "../../../components/icons/evaIcons";
import Button from "../../../components/ui/Button";
import StatusPill from "../../../components/ui/StatusPill";
import { displayPlaceName } from "../../../lib/utils";

/** Back link + hero header — name, address, status pills and the danger-zone action. */
const FacilityDetailHeader = ({ facility, deleted, onAction }) => (
  <>
    <Link
      to="/facilities"
      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-ink transition hover:text-primary-strong"
    >
      <ArrowLeft size={12} strokeWidth={2} /> Back to facilities
    </Link>

    <header className="mb-4 mt-2 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-[22px] font-bold leading-tight text-ink">
          {facility ? displayPlaceName(facility.name) : "Facility"}
        </h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <p className="inline-flex items-center gap-1 text-[13px] text-muted">
            <MapPin size={11} strokeWidth={1.9} aria-hidden="true" />
            {facility ? displayPlaceName(facility.address) : "Loading facility…"}
          </p>
          {facility && (
            <>
              <StatusPill status={facility.status} />
              <StatusPill tone="neutral">Max capacity {facility.maxCapacity}</StatusPill>
            </>
          )}
        </div>
      </div>
      {facility && (
        <Button
          variant={deleted ? "primary" : "danger"}
          size="sm"
          onClick={onAction}
        >
          {deleted ? (
            <><RotateCcw size={12} strokeWidth={2} className="mr-1" /> Restore facility</>
          ) : (
            <><Trash2 size={12} strokeWidth={2} className="mr-1" /> Delete facility</>
          )}
        </Button>
      )}
    </header>
  </>
);

export default FacilityDetailHeader;
