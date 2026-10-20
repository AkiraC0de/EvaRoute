/**
 * Neutral surface-tone loading skeleton (never primary-colored).
 * Placeholder blocks for data that is on its way.
 */
const Skeleton = ({ className = "", ...props }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-md bg-surface-2 motion-reduce:animate-none ${className}`}
    {...props}
  />
);

export default Skeleton;
