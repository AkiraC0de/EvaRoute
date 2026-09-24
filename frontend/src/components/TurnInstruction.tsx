interface TurnInstructionProps {
  instruction: string;
  distance?: number;
}

export default function TurnInstruction({ instruction, distance }: TurnInstructionProps) {
  return (
    <div
      className="turn-instruction"
    >
      <span className="turn-instruction-icon" aria-hidden="true">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14m0 0l-5-5m5 5l-5 5" />
        </svg>
      </span>
      <span aria-live="polite">{instruction}</span>
      {distance !== undefined && (
        <span className="distance">
          {distance.toFixed(1)} km
        </span>
      )}
    </div>
  );
}
