import { useState } from "react";
import { Copy } from "../../components/icons/evaIcons";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

/**
 * One-time display for a server-generated default password (staff create /
 * reset-password both return it exactly once — it is also emailed to the
 * staff member). Copy-to-clipboard, then gone on close.
 */
const GeneratedPasswordModal = ({ title, email, password, onClose }) => {
  // Copy feedback mirrors CopyId: the clipboard can be missing (insecure
  // context) or denied — surface "Copy failed" instead of claiming success
  // off a floating promise (which also left an unhandled rejection).
  const [copyState, setCopyState] = useState("");

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    setTimeout(() => setCopyState(""), 1400);
  };

  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-[12px] leading-relaxed text-muted">
        Account <span className="font-semibold text-ink-soft">{email}</span> is ready. Share
        this password securely — it is shown only once and also emailed to the staff member.
      </p>

      <div className="mt-3 flex items-center gap-2 rounded-md border border-line bg-surface-2 px-3 py-2.5">
        <code className="flex-1 select-all break-all text-[14px] font-bold tracking-[1px] text-ink-soft">
          {password}
        </code>
        <Button
          variant="neutral"
          size="sm"
          onClick={copyPassword}
        >
          <Copy size={11} strokeWidth={2} className="mr-1" />{" "}
          {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy"}
        </Button>
      </div>

      <Button onClick={onClose} className="mt-4 w-full" size="sm">
        Done
      </Button>
    </Modal>
  );
};

export default GeneratedPasswordModal;
