/**
 * Band heading for the Occupancy page: an uppercase title + a short caption.
 * With `top`, a hairline separator sits above the heading — used between the
 * overview band and the operations band so the page reads as two precise
 * sections.
 */
const SectionHeader = ({ title, caption, top = false }) => (
  <div className={top ? "mt-2 border-t border-line pt-4" : ""}>
    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.8px] text-ink-soft">
        {title}
      </h2>
      <p className="text-[11px] text-muted">{caption}</p>
    </div>
  </div>
);

export default SectionHeader;
