import { ChevronRight } from "../../components/icons/evaIcons";
import Button from "../../components/ui/Button";

/**
 * One row in the Security section: tinted icon chip + title + description,
 * with the action right-aligned (content left, verbs right). Neutral rows
 * are reversible actions with a text action; only the terminal action
 * renders as the danger row — the row itself is the button, so the final,
 * irreversible step can never read as a benign one. Both variants support a
 * description.
 */
const SecurityAction = ({
  icon,
  title,
  description,
  actionLabel,
  variant = "neutral",
  onClick,
  showArrow = false,
}) => {
  const chip =
    variant === "danger"
      ? "bg-danger-soft text-danger"
      : "bg-primary-soft text-primary-ink";

  if (variant === "danger") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-12 w-full items-center gap-3 rounded-md border border-danger/15 bg-danger-soft px-3 py-2 text-left transition-colors hover:bg-danger-soft-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
      >
        <span
          aria-hidden="true"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${chip}`}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-bold text-danger-strong">
            {title}
          </span>
          {description && (
            <span className="block text-[11px] text-danger">{description}</span>
          )}
        </span>
        <ChevronRight
          size={15}
          aria-hidden="true"
          className="shrink-0 text-danger"
        />
      </button>
    );
  }

  return (
    <div className="flex min-h-12 flex-wrap items-center gap-3 rounded-md border border-line bg-surface px-3 py-2">
      <span
        aria-hidden="true"
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${chip}`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-bold text-ink-soft">{title}</p>
        {description && (
          <p className="text-[11px] text-muted text-pretty">{description}</p>
        )}
      </div>
      <Button variant="neutral" size="sm" onClick={onClick} className="shrink-0">
        {actionLabel}
        {showArrow && (
          <ChevronRight size={14} aria-hidden="true" className="ml-1 leading-none" />
        )}
      </Button>
    </div>
  );
};

export default SecurityAction;
