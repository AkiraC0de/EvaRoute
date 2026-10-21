import { useState } from "react";
import { Check, Copy, Printer } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import CopyId from "../../components/ui/CopyId";
import { checkInCode, formatCheckedInAt, splitMembers } from "./occupancyUtils";
import "./ticket.css";

/**
 * Check-in confirmation ticket — an admission slip shown after a household is
 * successfully checked in. Styled like printed ticket paper (built from the
 * flat design tokens): micro brand header,
 * focal Check-In ID ("0001", the per-facility number returned by the server —
 * never invented client-side), a decorative barcode strip, a perforated tear
 * seam with edge notches, and a keep-this stub that repeats the ID.
 *
 * Actions: copy the ID, print the slip (dedicated print layout via
 * ticket.css), or close. Renders only for a real, successful stay.
 */
const CheckInTicket = ({ stay, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { total, children, adults } = splitMembers(stay.members);
  const code = checkInCode(stay);
  const date = new Date(stay.checkedInAt);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions/insecure context) — the ID is on
      // screen and selectable, so nothing is lost.
    }
  };

  return (
    <Modal title="Check-in confirmed" onClose={onClose}>
      <div className="ticket-print-root">
        <div className="rounded-lg border border-line bg-surface p-5">
          {/* Printed header, like a real slip */}
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-muted">
              EvaRoute · Check-in slip
            </p>
            <p className="text-[10px] uppercase tracking-[1px] text-muted-dim">
              {Number.isNaN(date.getTime())
                ? ""
                : date.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
            </p>
          </div>

          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-[1px] text-success">
              <Check size={10} strokeWidth={3} aria-hidden="true" /> Checked in
            </span>

            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[2px] text-muted">
              Check-in ID
            </p>
            <CopyId
              value={code}
              label="Check-in ID"
              className="mt-1.5 font-mono text-[28px] font-bold leading-none tracking-[6px] text-ink"
            />

            <div className="mt-4 space-y-1">
              <p className="text-[15px] font-bold text-ink-soft">{stay.familyName}</p>
              <p className="text-[11px] text-muted">
                {total} {total === 1 ? "member" : "members"} · {adults} adult
                {adults === 1 ? "" : "s"}, {children} {children === 1 ? "child" : "children"}
              </p>
              <p className="text-[11px] text-muted">Checked in {formatCheckedInAt(stay.checkedInAt)}</p>
            </div>
          </div>

          {/* Decorative barcode strip — printed tickets have one; the ID above
              is the accessible source of truth. */}
          <div
            aria-hidden="true"
            className="mt-4 h-8 w-full opacity-80"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 4px, currentColor 4px 7px, transparent 7px 11px)",
            }}
          />
        </div>

        {/* Perforation: dashed tear seam with edge notches cut into the seam */}
        <div className="relative my-3">
          <div className="border-t-2 border-dashed border-line" />
          <span
            aria-hidden="true"
            className="absolute -left-[10px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-surface"
          />
          <span
            aria-hidden="true"
            className="absolute -right-[10px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-surface"
          />
        </div>

        {/* Stub — the keep-this tint band */}
        <div className="flex items-center justify-between gap-3 rounded-md bg-surface-2 px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[2px] text-muted">
              Keep this stub
            </p>
            <CopyId
              value={code}
              label="Check-in ID"
              className="mt-0.5 font-mono text-[15px] font-bold tracking-[3px] text-ink-soft"
            />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[1px] text-muted-dim">
            EvaRoute
          </p>
        </div>
      </div>

      <div className="ticket-actions mt-4 flex flex-wrap items-center justify-end gap-2">
        <Button variant="neutral" size="sm" onClick={copyId} className="inline-flex items-center gap-1.5">
          <Copy size={12} strokeWidth={2} aria-hidden="true" />
          {copied ? "Copied" : "Copy ID"}
        </Button>
        <Button
          variant="neutral"
          size="sm"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5"
        >
          <Printer size={12} strokeWidth={2} aria-hidden="true" /> Print
        </Button>
        <Button size="sm" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
};

export default CheckInTicket;
