export default function CenterDistance({ distance, className = '', }) {
    return (<span className={`text-[var(--font-size-sm)] text-[var(--color-text-secondary)] ${className}`}>
      {distance.toFixed(1)} km
    </span>);
}
