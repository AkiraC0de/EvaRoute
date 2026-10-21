import { useState } from "react";
import { Check, X } from "lucide-react";

/**
 * Click-to-copy identifier — the ID text itself is the affordance (no button
 * furniture): clicking copies it to the clipboard and the text briefly swaps
 * to "Copied" / "Copy failed" with an icon. Color feedback is optional so the
 * control also works on dark panels (state reads via icon + word). It is a
 * real button, so keyboard users can Tab to it and press Enter.
 */
const CopyId = ({ value, label, colorFeedback = true, className = "" }) => {
  const [state, setState] = useState("");

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState(""), 1400);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={`Copy ${value}`}
      aria-label={`Copy ${label ?? "identifier"} ${value}`}
      className={`inline-flex items-center gap-1 text-left font-mono transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink ${className}`}
    >
      {state === "copied" ? (
        <>
          <Check size="1em" strokeWidth={2.5} aria-hidden="true" className={colorFeedback ? "text-success" : ""} />
          Copied
        </>
      ) : state === "failed" ? (
        <>
          <X size="1em" strokeWidth={2.5} aria-hidden="true" className={colorFeedback ? "text-danger" : ""} />
          Copy failed
        </>
      ) : (
        value
      )}
    </button>
  );
};

export default CopyId;
