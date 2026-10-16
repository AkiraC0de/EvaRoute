export default function CenterDistance({ distance, className = '' }) {
  return <span className={`text-[13px] text-muted ${className}`}>{distance.toFixed(1)} km</span>;
}
