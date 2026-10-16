import { useState } from "react";
import { Check, Copy, Printer } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { formatCheckedInAt, splitMembers } from "./occupancyUtils";
import "./ticket.css";

/**
 * Check-in confirmation ticket — the admission slip shown after a household
 * is successfully checked in. The Check-In ID is the `stay.id` returned by
 * POST /facility/:facilityId/stay (never invented client-side) and is the
 * visual focal point: staff read it aloud to the household.
 *
 * Actions: copy the ID, print the slip (dedicated print layout via
 * ticket.css), or close. Renders only for a real, successful stay.
 */
const CheckInTicket = ({ stay, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { total, children, adults } = splitMembers(stay.members);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(String(stay.id));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions/insecure context) — the ID is
      // on screen and selectable, so nothing is lost.
    }
  };

  return (
    <Modal title="Check-in confirmed" onClose={onClose}>
      <div className="ticket-print-root">
        <div className="rounded-clay-sm bg-sunken px-4 py-5 text-center shadow-clay-inset">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[8px] font-bold text-success">
            <Check size={10} strokeWidth={3} aria-hidden="true" /> CHECKED IN
          </span>

          <p className="mt-3 text-[8px] font-semibold uppercase tracking-[1px] text-muted">
            Check-in ID
          </p>
          <p
            aria-label={`Check-in ID ${stay.id}`}
            className="mt-1 break-all font-mono text-[15px] font-bold leading-6 tracking-[1.5px] text-ink"
          >
            {stay.id}
          </p>

          <div className="mt-4 space-y-1">
            <p className="text-[12px] font-bold text-ink-soft">{stay.familyName}</p>
            <p className="text-[9px] text-muted">
              {total} {total === 1 ? "member" : "members"} · {adults} adult{adults === 1 ? "" : "s"},{" "}
              {children} {children === 1 ? "child" : "children"}
            </p>
            <p className="text-[9px] text-muted">Checked in {formatCheckedInAt(stay.checkedInAt)}</p>
          </div>
        </div>

        {/* Perforation: dashed seam + edge notches, like a printed stub. */}
        <div className="relative my-3">
          <div className="border-t-2 border-dashed border-line" />
          <span
            aria-hidden="true"
            className="absolute -left-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-surface shadow-clay-inset"
          />
          <span
            aria-hidden="true"
            className="absolute -right-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-surface shadow-clay-inset"
          />
        </div>

        <div className="flex items-center justify-between gap-3 px-1">
          <p className="text-[9px] text-muted">Present this ID when asked about the stay.</p>
          <p className="shrink-0 text-[8px] font-semibold uppercase tracking-[1px] text-muted-dim">
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
