import { ChevronRight } from "lucide-react";
import Button from "../../components/ui/Button";

/**
 * One row in the Security section: icon + title (+ description) and the
 * action control. Reversible actions render as a quiet neutral row with a
 * text action on the right; only the terminal action renders as the danger
 * row (the row itself is the button).
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
  const iconElement = (
    <span
      aria-hidden="true"
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface ${
        variant === "danger" ? "text-danger" : "text-primary-ink"
      }`}
    >
      {icon}
    </span>
  );

  if (variant === "danger") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-12 w-full items-center gap-3 rounded-md border border-danger/15 bg-danger-soft px-3 py-2 text-left text-danger-strong transition hover:bg-danger-soft-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
      >
        {iconElement}
        <span className="text-[12px] font-semibold">{title}</span>
      </button>
    );
  }

  return (
    <div className="flex min-h-12 items-center gap-3 rounded-md border border-line bg-surface-2 px-3 py-2">
      {iconElement}
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-bold text-ink-soft">{title}</p>
        {description && (
          <p className="text-[11px] text-muted">{description}</p>
        )}
      </div>
      <Button
        variant={variant}
        onClick={onClick}
        className="shrink-0 border-transparent bg-transparent px-1 py-1 text-[11px] hover:bg-transparent hover:text-ink"
      >
        {actionLabel}
        {showArrow && <ChevronRight size={15} className="ml-2 leading-none" />}
      </Button>
    </div>
  );
};

export default SecurityAction;
