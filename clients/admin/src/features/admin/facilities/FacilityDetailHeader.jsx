import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Trash2, RotateCcw } from "lucide-react";
import Button from "../../../components/ui/Button";
import StatusPill from "../../../components/ui/StatusPill";

/** Back link + hero header — name, address, status pills and the danger-zone action. */
const FacilityDetailHeader = ({ facility, deleted, onAction }) => (
  <>
    <Link
      to="/facilities"
      className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent transition hover:text-accent-strong"
    >
      <ArrowLeft size={12} strokeWidth={2} /> Back to facilities
    </Link>

    <header className="mb-4 mt-2 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-[22px] font-bold leading-tight text-ink">
          {facility?.name ?? "Facility"}
        </h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <p className="inline-flex items-center gap-1 text-[13px] text-muted">
            <MapPin size={11} strokeWidth={1.9} aria-hidden="true" />
            {facility ? facility.address : "Loading facility…"}
          </p>
          {facility && (
            <>
              <StatusPill tone={facility.status === "AVAILABLE" ? "success" : "warning"}>
                {facility.status === "AVAILABLE" ? "Available" : "Unavailable"}
              </StatusPill>
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
