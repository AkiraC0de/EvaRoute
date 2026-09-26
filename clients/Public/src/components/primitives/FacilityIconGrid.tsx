import type { ReactNode } from 'react';

/**
 * FacilityIconGrid — 4-column grid of amenity icons.
 *
 * Reflects the Figma design (Frame 05 / 14): outlined icons in rounded
 * square containers, 4 across. Each cell shows an icon + optional label.
 *
 * When no resources are provided (backend not wired yet), renders nothing —
 * the component is ready but waits for real data.
 */
interface FacilityIconGridProps {
  resources?: FacilityIcon[];
  className?: string;
}

interface FacilityIcon {
  id: string;
  type?: string;
  name?: string;
}

const amenityIcons: Record<string, ReactNode> = {
  water: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5a7 7 0 0 0-7 7c0 3.5 2.5 6.5 7 10 4.5-3.5 7-6.5 7-10a7 7 0 0 0-7-7z" />
      <path d="M12 14v6" />
      <path d="M8 17h8" />
    </svg>
  ),
  medical: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
      <path d="M12 8v4l3 3" />
    </svg>
  ),
  food: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M2 12h20" />
      <circle cx="12" cy="12" r="4.5" />
    </svg>
  ),
  shelter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M5 21V8l7-4 7 4v13M8 21v-6h8v6" />
    </svg>
  ),
  electricity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 13h8l-1 8 9-10h-8l1-8z" />
    </svg>
  ),
  restrooms: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6M10 3v6.5a4.5 4.5 0 0 1 0 9h-2a4.5 4.5 0 0 1 0-9V3" />
      <path d="M14 3v6.5a4.5 4.5 0 0 0 0 9h2a4.5 4.5 0 0 0 0-9V3" />
    </svg>
  ),
  phones: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.22 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.74 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.09 6.09l.81-.81a2 2 0 0 1 2.11-.45c.91.37 1.85.61 2.81.74a2 2 0 0 1 1.72 2z" />
    </svg>
  ),
  parking: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 16v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h3M19 4h-4M16 20h-3M8 4h3v16H8z" />
    </svg>
  ),
  wheelchair: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2" />
      <path d="M6 12h6l2 3h2a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4h2l2-3H6z" />
    </svg>
  ),
};

function defaultIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l3 3" />
    </svg>
  );
}

export default function FacilityIconGrid({ resources, className = '' }: FacilityIconGridProps) {
  if (!resources?.length) return null;

  return (
    <div className={`facility-icon-grid ${className}`}>
      {resources.slice(0, 8).map((r) => {
        const typeKey = r.type?.toLowerCase() ?? '';
        const nameKey = r.name?.toLowerCase() ?? '';
        const icon = amenityIcons[typeKey] ?? amenityIcons[nameKey] ?? defaultIcon();
        return (
          <div key={r.id ?? r.type} className="facility-icon-cell" title={r.name ?? r.type}>
            {icon}
          </div>
        );
      })}
    </div>
  );
}
