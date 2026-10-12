import Button from "./Button";

/**
 * Shared loading / empty / error block.
 *
 * Used so that a failed request can never be mistaken for an empty result: the
 * error tone always renders the API's own message and a retry control.
 */
const TONES = {
  info: {
    wrap: "bg-[#f6f8fc] text-[#65718c]",
    title: "text-[#35405d]",
  },
  empty: {
    wrap: "bg-[#f6f8fc] text-[#7180a0]",
    title: "text-[#35405d]",
  },
  error: {
    wrap: "bg-[#fbe4e3] text-[#d8322d]",
    title: "text-[#b3261f]",
  },
};

const StatusPanel = ({ tone = "info", title, children, onRetry, retryLabel = "Try again" }) => {
  const palette = TONES[tone] ?? TONES.info;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-[18px] px-4 py-6 text-center text-[11px] ${palette.wrap}`}
    >
      {title && (
        <p className={`text-[12px] font-bold ${palette.title}`}>{title}</p>
      )}
      {children && <p className="mt-1 leading-relaxed">{children}</p>}
      {onRetry && (
        <Button variant="neutral" onClick={onRetry} className="mt-3 px-3 py-1.5 text-[9px]">
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export default StatusPanel;
