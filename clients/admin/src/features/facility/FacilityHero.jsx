import { Building2, MapPin, Fingerprint } from "lucide-react";

/**
 * Facility hero — the "My Facility" centerpiece (occupancy hero anatomy:
 * header row → oversized name → supporting line → unique fact chip). Flat
 * navy identity band (places identity, warm accents live on the tiles and
 * location card); the status chip carries words, color only reinforces it.
 * The tiles beside the hero own capacity/essentials/resources — those facts
 * are deliberately not repeated here.
 */
const FacilityHero = ({ facility, available }) => {
  const facilityIdLabel = `ID-${String(facility.id ?? "").slice(0, 8).toUpperCase()}`;
  return (
    <section
      aria-label="Facility overview"
      className="relative flex h-full flex-col overflow-hidden rounded-lg bg-primary p-5"
    >
      <div className="relative flex h-full flex-col">
        {/* Header row: label left, status chip right */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/20 text-white"
            >
              <Building2 size={17} strokeWidth={1.9} />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.8px] text-white/90">
              Evacuation center
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-ink-soft">
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${available ? "bg-success" : "bg-danger"}`}
            />
            {available ? "Available" : "Unavailable"}
          </span>
        </div>

        {/* Identity block — vertically centered so the card never reads
            half-empty when there is no note. */}
        <div className="flex flex-1 flex-col justify-center py-3">
          <h1 className="text-[22px] font-bold leading-tight text-white break-words">
            {facility.name}
          </h1>

          <p className="mt-1.5 inline-flex items-start gap-1.5 text-[12px] font-medium text-white/90">
            <MapPin size={13} strokeWidth={1.9} className="mt-0.5 shrink-0" aria-hidden="true" />
            {facility.address}
          </p>

          {facility.note ? (
            <p className="mt-2 rounded-md bg-white/15 px-3 py-2 text-[11px] italic leading-relaxed text-white/90">
              {facility.note}
            </p>
          ) : null}
        </div>

        {/* Unique fact chip — capacity/essentials/resources live in the
            tiles beside the hero and are deliberately not repeated here. */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white">
            <Fingerprint size={12} strokeWidth={2} aria-hidden="true" />
            Facility ID <span className="font-mono tracking-[1px]">{facilityIdLabel}</span>
          </span>
        </div>
      </div>
    </section>
  );
};

export default FacilityHero;
