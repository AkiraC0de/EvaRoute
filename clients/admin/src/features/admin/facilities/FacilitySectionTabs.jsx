import { useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Sticky anchor tabs over the detail page's independent sections — the long
 * stacked column becomes jumpable without touching the sections' own hooks
 * (a failed section still can't blank its siblings).
 */
const TABS = [
  { id: "facility-overview", label: "Overview" },
  { id: "facility-resources", label: "Resources" },
  { id: "facility-staff", label: "Staff" },
  { id: "facility-stays", label: "Stays" },
  { id: "facility-activity", label: "Activity" },
];

const FacilitySectionTabs = ({ deleted = false }) => {
  const [active, setActive] = useState("facility-overview");
  const reduceMotion = useReducedMotion();

  // Soft-deleted facilities pause staff/resources/stays — only the sections
  // that still load get anchors.
  const tabs = deleted
    ? TABS.filter((tab) => tab.id === "facility-overview" || tab.id === "facility-activity")
    : TABS;

  return (
    <nav
      aria-label="Facility sections"
      className="sticky top-0 z-20 -mx-1 mb-4 flex flex-wrap items-center gap-1 border-b border-line bg-canvas/95 px-1 py-2 backdrop-blur"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          aria-pressed={active === tab.id}
          onClick={() => {
            setActive(tab.id);
            document
              .getElementById(tab.id)
              ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
          }}
          className={`min-h-9 rounded-md px-2.5 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink ${
            active === tab.id
              ? "bg-primary-soft text-primary-ink"
              : "text-muted hover:bg-surface-2 hover:text-ink-soft"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default FacilitySectionTabs;
