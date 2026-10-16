/**
 * Standard page heading (title + optional subtitle) used by every screen so
 * the page hierarchy stays consistent.
 */
const PageHeader = ({
  title,
  subtitle,
  className = "mb-4",
  subtitleClassName = "mt-1 text-[13px] text-muted",
  actions,
}) => (
  <header className={`flex flex-wrap items-start justify-between gap-3 ${className}`}>
    <div>
      <h1 className="text-[22px] font-bold leading-tight text-ink">{title}</h1>
      {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </header>
);

export default PageHeader;
