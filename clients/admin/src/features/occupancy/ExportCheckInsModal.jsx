import { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { buildSummary, exportCheckInsCsv, exportCheckInsPdf } from "./checkInExport";

/**
 * Export dialog for the Occupancy overview — downloads the facility's
 * active check-ins in two shapes:
 *
 *   PDF — printable "Checked-in Evacuee List" (facility header, meal-count
 *         summary block, one row per person). For officials, the kitchen,
 *         or anyone asking "who is here?".
 *   CSV — one row per person for spreadsheets (meal planning, relief
 *         packing, reconciliation).
 *
 * Everything is generated client-side from the stays already on the page.
 */
const FORMATS = [
  {
    key: "pdf",
    label: "PDF",
    Icon: FileText,
    blurb: "Printable evacuee list — header, counts and every checked-in name.",
  },
  {
    key: "csv",
    label: "CSV",
    Icon: FileSpreadsheet,
    blurb: "One row per person for Excel or Google Sheets.",
  },
];

const ExportCheckInsModal = ({ stays, occupancy, facility, user, onClose }) => {
  const [format, setFormat] = useState("pdf");
  const summary = buildSummary(stays);
  const place = facility?.name ?? "this facility";
  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const download = () => {
    if (format === "pdf") {
      exportCheckInsPdf({ stays, facility, occupancy, user });
    } else {
      exportCheckInsCsv({ stays, facility });
    }
    onClose();
  };

  return (
    <Modal title="Export check-in data" onClose={onClose}>
      {/* Live preview of exactly what gets exported */}
      <div className="rounded-md border border-line bg-surface-2 px-3 py-2.5">
        <p className="text-[12px] font-bold text-ink-soft">
          {summary.households} household{summary.households === 1 ? "" : "s"} ·{" "}
          {summary.adults} adult{summary.adults === 1 ? "" : "s"} · {summary.children}{" "}
          child{summary.children === 1 ? "" : "ren"} · {summary.people} people
        </p>
        <p className="mt-0.5 text-[11px] text-muted">
          {place} · {today}
        </p>
      </div>

      <div
        role="group"
        aria-label="Export format"
        className="mt-3 flex items-center gap-2"
      >
        {FORMATS.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            aria-pressed={format === key}
            onClick={() => setFormat(key)}
            className={`flex flex-1 items-center gap-2 rounded-md px-3 py-2.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              format === key
                ? "bg-primary text-white"
                : "bg-surface-2 text-muted hover:text-ink-soft"
            }`}
          >
            <Icon size={15} strokeWidth={1.9} aria-hidden="true" />
            <span className="text-[12px] font-semibold">{label}</span>
          </button>
        ))}
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        {FORMATS.find((item) => item.key === format)?.blurb}
      </p>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="neutral" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={download}>
          <Download size={12} strokeWidth={2} className="mr-1" /> Download {format.toUpperCase()}
        </Button>
      </div>
    </Modal>
  );
};

export default ExportCheckInsModal;
