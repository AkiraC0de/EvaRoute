import Button from "./Button";

/**
 * Shared loading / empty / error block.
 *
 * Used so that a failed request can never be mistaken for an empty result: the
 * error tone always renders the API's own message and a retry control.
 */
const TONES = {
  info: {
    wrap: "bg-sunken text-[#65718c] shadow-clay-inset",
    title: "text-ink-soft",
  },
  empty: {
    wrap: "bg-sunken text-[#7180a0] shadow-clay-inset",
    title: "text-ink-soft",
  },
  error: {
    wrap: "bg-danger-soft text-danger shadow-clay-inset",
    title: "text-danger-strong",
  },
};

const StatusPanel = ({ tone = "info", title, children, onRetry, retryLabel = "Try again" }) => {
  const palette = TONES[tone] ?? TONES.info;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-clay px-4 py-6 text-center text-[13px] ${palette.wrap}`}
    >
      {title && (
        <p className={`text-[14px] font-bold ${palette.title}`}>{title}</p>
      )}
      {children && <p className="mt-1 leading-relaxed">{children}</p>}
      {onRetry && (
        <Button variant="neutral" size="sm" onClick={onRetry} className="mt-3">
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export default StatusPanel;
