/**
 * Citizen-facing facility status vocabulary.
 *
 * The backend `FacilityStatus` enum is AVAILABLE | UNAVAILABLE, and since
 * API-04 the public feed returns EVERY non-deleted facility with its status,
 * so full/closed centers stay visible instead of silently vanishing. The
 * LIMITED entry is legacy-drift tolerance only (no current enum value) — kept
 * so a legacy row still labels truthfully instead of crashing the badge.
 */
export const FACILITY_STATUS_META = {
    AVAILABLE: {
        label: 'Open',
        fullLabel: 'Open',
        color: 'var(--color-success)',
        background: 'var(--color-success-soft)',
    },
    LIMITED: {
        label: 'Limited',
        fullLabel: 'Limited availability',
        color: 'var(--color-warning)',
        background: 'var(--color-warning-soft)',
    },
    // UNAVAILABLE does not say WHY: the center may be full or closed, so the
    // long label must not claim a single cause.
    UNAVAILABLE: {
        label: 'Full',
        fullLabel: 'Full or closed',
        color: 'var(--color-danger)',
        background: 'var(--color-danger-soft)',
    },
};
/**
 * Status meta with a truthful fallback: an unexpected status renders as its
 * own name (muted chip) instead of crashing the badge/marker on `undefined`.
 */
export function getFacilityStatusMeta(status) {
    return (status && FACILITY_STATUS_META[status]) || {
        label: status || 'Unknown',
        fullLabel: status || 'Status unknown',
        color: 'var(--color-muted-dim)',
        background: 'var(--color-sunken)',
    };
}
/**
 * PROVISIONAL: Current occupancy is NOT available from the backend.
 * The public facility DTO exposes maxCapacity but no occupancy count.
 * This field is reserved for future backend integration.
 */
// export interface FacilityWithOccupancy extends Facility {
//   currentOccupancy?: number; // NOT YET AVAILABLE
// }
