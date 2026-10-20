/**
 * Flat surface container — the base container of the design system (panels,
 * forms, tables sit on it). Hairline border + white fill; drop shadows are
 * reserved for overlays and popovers. `pad`/`className` adjust per use site.
 */
const Card = ({ as: Tag = "div", pad = "p-4", className = "", children, ...props }) => (
  <Tag className={`rounded-lg border border-line bg-surface ${pad} ${className}`} {...props}>
    {children}
  </Tag>
);

export default Card;
