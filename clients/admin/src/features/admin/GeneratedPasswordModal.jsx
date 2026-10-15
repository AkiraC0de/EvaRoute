import { useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

/**
 * One-time display for a server-generated default password (staff create /
 * reset-password both return it exactly once — it is also emailed to the
 * staff member). Copy-to-clipboard, then gone on close.
 */
const GeneratedPasswordModal = ({ title, email, password, onClose }) => {
  const [copied, setCopied] = useState(false);

  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-[10px] leading-relaxed text-[#65718c]">
        Account <span className="font-semibold text-[#35405d]">{email}</span> is ready. Share
        this password securely — it is shown only once and also emailed to the staff member.
      </p>

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#f6f8fc] px-3 py-2.5 shadow-[inset_0_2px_5px_rgba(40,55,90,0.12)]">
        <code className="flex-1 select-all break-all text-[12px] font-bold tracking-[1px] text-[#2f3d5f]">
          {password}
        </code>
        <Button
          variant="neutral"
          onClick={() => {
            navigator.clipboard?.writeText(password);
            setCopied(true);
          }}
          className="px-3 py-1 text-[9px]"
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <Button onClick={onClose} className="mt-4 w-full px-3 py-1.5 text-[9px]">
        Done
      </Button>
    </Modal>
  );
};

export default GeneratedPasswordModal;
