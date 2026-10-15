import { displayNameOf, roleLabelOf } from "../../lib/user";

/**
 * Account summary card: name, email, assigned facility + role pills.
 */
const AccountSummaryCard = ({ user, facility }) => {
  const fullName = displayNameOf(user);

  return (
    <section
      aria-label="Staff account summary"
      className="mb-4 rounded-[20px] bg-white px-3 py-3 shadow-[0_8px_20px_rgba(40,60,100,0.08)] sm:px-3"
    >
      <h2 className="text-[12px] font-bold text-[#34405f]">{fullName}</h2>
      <p className="text-[9px] text-[#5f7197]">{user?.email || "—"}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded-full bg-[#e9edf5] px-3 py-1 text-[8px] font-semibold text-[#7180a0]">
          {facility ? facility.name : "No facility assigned"}
        </span>
        <span className="rounded-full bg-[#e9edf5] px-3 py-1 text-[8px] font-semibold text-[#7180a0]">
          {roleLabelOf(user?.role)}
        </span>
      </div>
    </section>
  );
};

export default AccountSummaryCard;
