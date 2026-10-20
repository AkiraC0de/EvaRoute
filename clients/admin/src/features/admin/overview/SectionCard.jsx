import { CARD } from "./overviewStyles";

/** Section band — flat panel with its own titled header (title + caption,
 *  hairline separator) and an optional corner action. */
const SectionCard = ({ title, meta, action, children }) => (
  <section className={CARD}>
    <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
      <div>
        <h2 className="text-[13px] font-bold text-ink-soft">{title}</h2>
        {meta && <p className="mt-1 text-[11px] text-muted">{meta}</p>}
      </div>
      {action}
    </div>
    <div className="mt-4">{children}</div>
  </section>
);

export default SectionCard;
