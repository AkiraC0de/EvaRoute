/**
 * Clay table primitives for the data-management screens. The table sits on a
 * raised card; the header is a soft inset band; rows separate with hairlines
 * and lift slightly on hover so scanning stays easy.
 */

const TableShell = ({ children }) => (
  <div className="overflow-x-auto rounded-clay bg-surface shadow-clay">
    <table className="w-full min-w-[560px] text-left">{children}</table>
  </div>
);

const Th = ({ children, className = "" }) => (
  <th
    className={`px-4 py-2.5 label-micro text-muted-dim ${className}`}
  >
    {children}
  </th>
);

const Td = ({ children, className = "" }) => (
  <td className={`px-4 py-2.5 ${className}`}>{children}</td>
);

const Tr = ({ children }) => (
  <tr className="border-b border-line transition last:border-0 hover:bg-sunken/70">
    {children}
  </tr>
);

export { TableShell, Th, Td, Tr };
