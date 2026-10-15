/**
 * Standard page heading (title + optional subtitle) used by every screen so
 * the page hierarchy stays consistent. `subtitleClassName` exists for screens
 * whose original spacing differed slightly (the Occupancy screen used mt-0.5).
 */
const PageHeader = ({
  title,
  subtitle,
  className = "mb-3",
  subtitleClassName = "mt-1 text-[11px] text-[#8290aa]",
}) => (
  <header className={className}>
    <h1 className="text-[20px] font-bold leading-tight text-[#273556]">{title}</h1>
    {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
  </header>
);

export default PageHeader;
