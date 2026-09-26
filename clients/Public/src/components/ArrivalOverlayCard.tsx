import type { Facility } from '../types/facility';
import DragHandle from './primitives/DragHandle';
import PillButton from './primitives/PillButton';

interface ArrivalOverlayCardProps {
  facility: Facility | null;
  onFinish: () => void;
}

export default function ArrivalOverlayCard({ facility, onFinish }: ArrivalOverlayCardProps) {
  return (
    <div className="arrival-overlay" role="dialog" aria-modal="true" aria-labelledby="arrival-heading">
      <div className="arrival-backdrop" />
      <div className="arrival-card">
        <DragHandle />
        <div className="arrival-success-icon" aria-hidden="true">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4 4L19 7" />
          </svg>
        </div>
        <h2 id="arrival-heading" className="arrival-title">You have arrived</h2>
        <p className="arrival-facility-name">
          {facility?.name ? `${facility.name} Evacuation Center` : 'Evacuation Center'}
        </p>
        <PillButton variant="primary" className="arrival-finish-button" onClick={onFinish}>
          Finish
        </PillButton>
      </div>
    </div>
  );
}
