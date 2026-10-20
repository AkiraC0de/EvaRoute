/**
 * Flat table primitives for the data-management screens. The table sits in a
 * bordered white shell; the header is a muted band; rows separate with
 * hairlines and tint slightly on hover so scanning stays easy.
 */

const TableShell = ({ children }) => (
  <div className="overflow-x-auto rounded-lg border border-line bg-surface">
    <table className="w-full min-w-[560px] text-left">{children}</table>
  </div>
);

const Th = ({ children, className = "" }) => (
  <th className={`border-b border-line bg-surface-2 px-4 py-2.5 label-micro text-muted ${className}`}>
    {children}
  </th>
);

const Td = ({ children, className = "" }) => (
  <td className={`px-4 py-2.5 ${className}`}>{children}</td>
);

const Tr = ({ children }) => (
  <tr className="border-b border-line transition last:border-0 hover:bg-surface-2/60">
    {children}
  </tr>
);

export { TableShell, Th, Td, Tr };
