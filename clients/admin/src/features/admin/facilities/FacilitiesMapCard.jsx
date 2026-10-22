import { MapPin } from "../../../components/icons/evaIcons";
import FacilityOverviewMap from "../../map/FacilityOverviewMap";

/**
 * Map card — the registry's geographic surface over the legible OSM map.
 * Passes the list⇄map linkage through to the map: hover/selection rings and
 * selection callbacks live on the page.
 */
const FacilitiesMapCard = ({
  facilities,
  onView,
  onSelect,
  hoverId,
  selectedId,
  height = 500,
  title = "Facilities map",
}) => (
  <section className="mb-4 rounded-lg border border-line bg-surface p-4">
    <div className="flex items-start gap-2.5">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary-ink"
      >
        <MapPin size={15} strokeWidth={1.9} />
      </span>
      <div>
        <h2 className="text-[13px] font-bold text-ink-soft">{title}</h2>
        <p className="mt-0.5 text-[11px] text-muted">
          Select a marker or a row to link them — click a marker to zoom in
        </p>
      </div>
    </div>
    <div className="mt-3">
      <FacilityOverviewMap
        facilities={facilities}
        height={height}
        onView={onView}
        onSelect={onSelect}
        hoverId={hoverId}
        selectedId={selectedId}
      />
    </div>
  </section>
);

export default FacilitiesMapCard;
