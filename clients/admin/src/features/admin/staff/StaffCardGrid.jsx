import StaffIdCard from "./StaffIdCard";

/**
 * Staff accounts as a responsive grid of ID-style badge cards (replaces
 * the table): one card per account, 1-up → 2-up (sm) → 3-up (xl) inside
 * the 1280px content column. Same props the table took.
 */
const StaffCardGrid = ({ staffs, currentEmail, onEdit, onAssign, onAction }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {staffs.map((staff) => (
      <StaffIdCard
        key={staff.id}
        staff={staff}
        isSelf={staff.email === currentEmail}
        onEdit={onEdit}
        onAssign={onAssign}
        onAction={onAction}
      />
    ))}
  </div>
);

export default StaffCardGrid;
