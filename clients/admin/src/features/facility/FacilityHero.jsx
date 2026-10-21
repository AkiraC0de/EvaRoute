import { Building2, Fingerprint, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import CopyId from "../../components/ui/CopyId";

/**
 * Command hero — the "My Facility" centerpiece, built as an asymmetric
 * operations band: facility identity on the left (the page's single most
 * important information), a live status console on the right.
 *
 * The console quantifies the facility's condition: open/closed, people
 * on site versus capacity (real occupancy endpoint — { members,
 * maxCapacity, families, adults, children, remaining }), and the mandatory
 * essentials as labelled segments. State is spelled out in words; color
 * only reinforces it. When occupancy has not loaded, the meter waits —
 * no invented numbers.
 */
const FacilityHero = ({ facility, available, essentials, occupancy }) => {
  const facilityIdLabel = String(facility.id ?? "").slice(0, 8).toUpperCase();
  const essentialsReady = essentials.filter((entry) => entry.ready).length;

  const onSite = occupancy?.members ?? null;
  const maxCapacity = occupancy?.maxCapacity ?? facility.maxCapacity;
  const fillPercent =
    onSite !== null && maxCapacity > 0
      ? Math.min(100, Math.round((onSite / maxCapacity) * 100))
      : 0;

  return (
    <section
      aria-label="Facility overview"
      className="overflow-hidden rounded-lg bg-primary-strong"
    >
      <div className="grid gap-5 p-5 lg:grid-cols-[1.6fr_1fr] lg:p-6">
        {/* Identity */}
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/15 text-white"
            >
              <Building2 size={17} strokeWidth={1.9} />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.8px] text-white/85">
              Evacuation center · My facility
            </p>
          </div>

          <h1 className="mt-3 text-[26px] font-bold leading-tight text-white break-words sm:text-[30px]">
            {facility.name}
          </h1>

          <p className="mt-1.5 inline-flex items-start gap-1.5 text-[12px] font-medium text-white/85">
            <MapPin size={13} strokeWidth={1.9} className="mt-0.5 shrink-0" aria-hidden="true" />
            {facility.address}
          </p>

          {facility.note ? (
            <p className="mt-3 max-w-[60ch] rounded-md bg-white/12 px-3 py-2 text-[11px] italic leading-relaxed text-white/90">
              {facility.note}
            </p>
          ) : null}

          <div className="mt-auto flex flex-wrap gap-2 pt-3.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white">
              <Fingerprint size={12} strokeWidth={2} aria-hidden="true" />
              Facility ID{" "}
              <CopyId
                value={facilityIdLabel}
                label="Facility ID"
                colorFeedback={false}
                className="font-mono text-[11px] font-semibold tracking-[1px]"
              />
            </span>
          </div>
        </div>

        {/* Status console */}
        <div className="flex flex-col gap-4 rounded-md border border-white/20 bg-white/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-white/75">
              Facility status
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-ink-soft">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${available ? "bg-success" : "bg-danger"}`}
              />
              {available ? "Available" : "Unavailable"}
            </span>
          </div>

          {/* On site — the quantified condition */}
          <div>
            <div className="flex items-end justify-between gap-2">
              <p className="text-[11px] font-semibold text-white/90">On site now</p>
              <p className="text-[11px] font-bold text-white">
                {onSite !== null ? `${onSite} / ${maxCapacity}` : `— / ${maxCapacity}`}
              </p>
            </div>
            <div
              role="img"
              aria-label={
                onSite !== null
                  ? `${onSite} of ${maxCapacity} places occupied, ${occupancy.remaining} free`
                  : "Occupancy not loaded"
              }
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/25"
            >
              <span
                aria-hidden="true"
                className="block h-full rounded-full bg-white"
                style={{ width: `${fillPercent}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-white/70">
              {occupancy
                ? `${occupancy.families} ${occupancy.families === 1 ? "family" : "families"} · ${occupancy.adults} adults · ${occupancy.children} children · ${occupancy.remaining} places free`
                : `Capacity ${maxCapacity} places`}
            </p>
          </div>

          {/* Essentials readiness */}
          <div>
            <div className="flex items-end justify-between gap-2">
              <p className="text-[11px] font-semibold text-white/90">Essentials readiness</p>
              <p className="text-[11px] font-bold text-white">
                {essentialsReady} / {essentials.length} ready
              </p>
            </div>
            <div
              role="img"
              aria-label={`${essentialsReady} of ${essentials.length} mandatory essentials ready`}
              className="mt-2 flex gap-1"
            >
              {essentials.map((entry) => (
                <span
                  key={entry.key}
                  title={`${entry.label} — ${entry.ready ? "ready" : "not ready"}`}
                  className={`h-1.5 flex-1 rounded-full ${entry.ready ? "bg-white" : "bg-white/35"}`}
                />
              ))}
            </div>
            <p className="mt-1.5 text-[10px] text-white/70">
              {essentials.map((entry) => entry.label.split(" (")[0].split(" /")[0]).join(" · ")}
            </p>
          </div>

          <Link
            to="/occupancy"
            className="mt-auto inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md bg-white px-3.5 text-[12px] font-semibold text-primary-ink transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-10"
          >
            View live occupancy
            <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FacilityHero;
