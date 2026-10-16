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
    UNAVAILABLE: {
        label: 'Full',
        fullLabel: 'Full',
        color: 'var(--color-full)',
        background: 'var(--color-full-soft)',
    },
};
/**
 * PROVISIONAL: Current occupancy is NOT available from the backend.
 * The public facility DTO exposes maxCapacity but no occupancy count.
 * This field is reserved for future backend integration.
 */
// export interface FacilityWithOccupancy extends Facility {
//   currentOccupancy?: number; // NOT YET AVAILABLE
// }
