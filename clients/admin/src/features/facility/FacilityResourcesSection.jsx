import { useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Search } from "../../components/icons/evaIcons";
import { CONTROL_CLASS } from "../../components/ui/FilterControls";
import StatusPanel from "../../components/ui/StatusPanel";
import ResourceCard from "./ResourceCard";
import ResourceCreateForm from "./ResourceCreateForm";

/**
 * Resources workspace — the page's management surface. Header with live
 * count, a search field and three segment filters (All / Essentials /
 * Unavailable) for quick scanning, then the create form and the resource
 * grid. Filtering is presentation-only over the API's name-ordered list —
 * every mutation still goes through the same hooks/endpoints.
 *
 * The search field reuses the shared filter-input geometry (CONTROL_CLASS)
 * so it matches every other filter band, and the segment filter is a
 * sliding pill (per-instance layoutId) like the rest of the app's
 * segmented controls.
 */
const SEGMENTS = [
  { key: "all", label: "All" },
  { key: "essential", label: "Essentials" },
  { key: "unavailable", label: "Unavailable" },
];

const FacilityResourcesSection = ({ resources, createResource, saveResource, removeResource }) => {
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState("all");
  const pillId = `resources-segment-${useId()}`;
  const reduceMotion = useReducedMotion();
  const pillTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 480, damping: 40, mass: 0.85 };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((resource) => {
      if (segment === "essential" && !resource.essentialType) return false;
      if (segment === "unavailable" && resource.isAvailable !== false) return false;
      if (q && !(resource.name ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [resources, query, segment]);

  return (
    <section aria-label="Resources and essentials">
      {/* Workspace header — count and the create action share the row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-bold text-ink-soft">Resources &amp; essentials</h2>
          <p className="mt-0.5 text-[11px] text-muted">
            Track and manage what the facility has
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-muted">
            {resources.length} recorded
          </span>
          <ResourceCreateForm onCreate={createResource} />
        </div>
      </div>

      {/* Search + segments */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="relative min-w-0 flex-1 sm:max-w-[260px]">
          <span className="sr-only">Search resources</span>
          <Search
            size={14}
            strokeWidth={1.9}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search resources…"
            className={`${CONTROL_CLASS} w-full pl-8 pr-3 placeholder:text-muted-dim`}
          />
        </label>
        <div
          role="group"
          aria-label="Filter resources"
          className="flex items-center gap-1 rounded-full bg-surface-2 p-1"
        >
          {SEGMENTS.map((entry) => {
            const active = segment === entry.key;
            return (
              <button
                key={entry.key}
                type="button"
                aria-pressed={active}
                onClick={() => setSegment(entry.key)}
                className={`relative min-h-8 rounded-full px-2.5 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink ${
                  active ? "text-primary-strong" : "text-muted hover:text-ink-soft"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId={pillId}
                    initial={false}
                    aria-hidden="true"
                    transition={pillTransition}
                    className="absolute inset-0 rounded-full bg-primary-soft"
                  />
                )}
                <span className="relative z-10">{entry.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        {resources.length === 0 ? (
          <StatusPanel tone="empty" title="No resources recorded">
            This facility has no resources yet. Add the first one above.
          </StatusPanel>
        ) : visible.length === 0 ? (
          <StatusPanel tone="empty" title="No resources match">
            No resource matches the current search and filter. Clear them to
            see all {resources.length} recorded.
          </StatusPanel>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visible.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onSave={(patch) => saveResource(resource.id, patch)}
                onDelete={() => removeResource(resource.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FacilityResourcesSection;
