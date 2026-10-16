import DragHandle from '../../components/ui/DragHandle';
import PillButton from '../../components/ui/PillButton';

export default function ArrivalOverlayCard({ facility, onFinish }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="arrival-heading">
      <div className="fixed inset-0 bg-[rgba(27,42,68,0.32)] backdrop-blur-[4px]" />
      <div className="animate-fade-scale relative z-[1] w-full max-w-[420px] rounded-clay-lg bg-surface p-6 text-center shadow-floating sm:p-8">
        <DragHandle className="mb-6" />
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success shadow-clay-xs sm:h-[72px] sm:w-[72px]" aria-hidden="true">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4 4L19 7" />
          </svg>
        </div>
        <h2 id="arrival-heading" className="text-[22px] font-bold leading-tight tracking-tight text-ink">
          You have arrived
        </h2>
        <p className="mt-2 text-[15px] font-semibold text-accent">
          {facility?.name ? `${facility.name} Evacuation Center` : 'Evacuation Center'}
        </p>
        <PillButton variant="primary" className="mt-6 w-full" onClick={onFinish}>
          Finish
        </PillButton>
      </div>
    </div>
  );
}
