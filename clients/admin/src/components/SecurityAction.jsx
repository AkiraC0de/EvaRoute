import Button from "./Button";

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
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white ${
        variant === "danger" ? "text-[#e64b43]" : "text-[#5269ef]"
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
        className="flex min-h-12 w-full items-center gap-3 rounded-2xl bg-[#fbe4e3] px-3 py-2 text-left text-[#d8322d] transition hover:bg-[#f8d8d6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e64b43]"
      >
        {iconElement}
        <span className="text-[10px] font-semibold">{title}</span>
      </button>
    );
  }

  return (
    <div className="flex min-h-12 items-center gap-3 rounded-2xl bg-[#f6f8fc] px-3 py-2 shadow-[inset_0_2px_5px_rgba(40,55,90,0.12)]">
      {iconElement}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-[#35405d]">{title}</p>
        {description && (
          <p className="text-[9px] text-[#7180a0]">{description}</p>
        )}
      </div>
      <Button
        variant={variant}
        onClick={onClick}
        className="shrink-0 bg-transparent px-1 py-1 text-[9px] hover:bg-transparent"
      >
        {actionLabel}
        {showArrow && <span className="ml-2 text-[15px] leading-none">›</span>}
      </Button>
    </div>
  );
};

export default SecurityAction;
