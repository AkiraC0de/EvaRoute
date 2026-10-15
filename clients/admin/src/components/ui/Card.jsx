/**
 * Raised clay surface — the base container of the design system (panels,
 * forms, tables, dialogs all sit on it). Soft drop shadow + white top sheen
 * give the molded-clay depth; `pad`/`className` adjust per use site.
 */
const Card = ({ as: Tag = "div", pad = "p-4", className = "", children, ...props }) => (
  <Tag className={`rounded-clay bg-surface shadow-clay ${pad} ${className}`} {...props}>
    {children}
  </Tag>
);

export default Card;
