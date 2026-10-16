/**
 * Consistent section container for the facility detail page: header row
 * (title left, action right) over the section content. One pattern for every
 * section so the page reads as one considered surface.
 */
const DetailSection = ({ title, action, children, className = "" }) => (
  <section aria-label={title} className={`rounded-clay bg-surface p-4 shadow-clay ${className}`}>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-[13px] font-bold text-ink-soft">{title}</h2>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
    {children}
  </section>
);

export default DetailSection;
