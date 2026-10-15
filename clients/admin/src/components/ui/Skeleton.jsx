/**
 * Neutral surface-tone loading skeleton (never accent-colored).
 * Placeholder blocks for data that is on its way.
 */
const Skeleton = ({ className = "", ...props }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-clay-sm bg-sunken motion-reduce:animate-none ${className}`}
    {...props}
  />
);

export default Skeleton;
