import { TableShell, Th } from "../../../components/ui/Table";
import StaffTableRow from "./StaffTableRow";

/** Staff accounts table — one row per account with the row actions. */
const StaffTable = ({ staffs, currentEmail, onEdit, onAction }) => (
  <TableShell>
    <thead>
      <tr className="bg-sunken">
        {["Name", "Email", "Facility", "Status", "Actions"].map((label) => (
          <Th key={label}>{label}</Th>
        ))}
      </tr>
    </thead>
    <tbody>
      {staffs.map((staff) => (
        <StaffTableRow
          key={staff.id}
          staff={staff}
          isSelf={staff.email === currentEmail}
          onEdit={onEdit}
          onAction={onAction}
        />
      ))}
    </tbody>
  </TableShell>
);

export default StaffTable;
