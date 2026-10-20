/**
 * Step indicator for multi-step flows (used by password reset).
 * `steps` is an array of labels; `current` is the active index.
 */
const StepProgress = ({ steps, current }) => (
  <ol className="mb-5 flex items-center gap-2">
    {steps.map((label, index) => {
      const state = index < current ? "done" : index === current ? "current" : "todo";
      return (
        <li key={label} className="flex flex-1 flex-col gap-1">
          <span
            className={`h-1 rounded-full ${
              state === "todo" ? "bg-line" : "bg-primary"
            }`}
          />
          <span
            className={`text-[10px] font-semibold uppercase tracking-[0.6px] ${
              state === "current"
                ? "text-primary"
                : state === "done"
                  ? "text-muted"
                  : "text-muted-dim"
            }`}
          >
            {index + 1}. {label}
          </span>
        </li>
      );
    })}
  </ol>
);

export default StepProgress;
