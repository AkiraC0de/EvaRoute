interface TurnInstructionProps {
  instruction: string;
  /** The maneuver type for icon selection: 'right', 'left', 'straight', 'u-turn', etc. */
  maneuverType?: string;
  distance?: number;
}

const maneuverIconPaths: Record<string, string> = {
  right: 'M5 12h14m0 0l-5-5m5 5l-5 5',
  left: 'M19 12H5m0 0l5-5m-5 5l5 5',
  u_turn: 'M6 12h12M8 6l8 6-8 6',
  straight: 'M5 12h14',
  'turn_right': 'M5 12h14m0 0l-5-5m5 5l-5 5',
  'turn_left': 'M19 12H5m0 0l5-5m-5 5l5 5',
  'uturn_left': 'M6 12h12M8 6l8 6-8 6',
  'uturn_right': 'M6 12h12M8 6l8 6-8 6',
  continue: 'M5 12h14',
};

function defaultIconPath() {
  return 'M5 12h14m0 0l-5-5m5 5l-5 5';
}

export default function TurnInstruction({
  instruction,
  maneuverType,
  distance,
}: TurnInstructionProps) {
  const key = maneuverType
    ? maneuverType.toLowerCase().replace(/[\s\-]+/g, '_')
    : '';
  const pathD = maneuverIconPaths[key] ?? defaultIconPath();

  return (
    <div className="turn-instruction">
      <span className="turn-instruction-next" aria-hidden="true">Next</span>
      <span className="turn-instruction-icon" aria-hidden="true">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={pathD} />
        </svg>
      </span>
      <span className="turn-instruction-text" aria-live="polite">{instruction}</span>
      {distance !== undefined && (
        <span className="turn-instruction-distance">
          {distance.toFixed(1)} km
        </span>
      )}
    </div>
  );
}
