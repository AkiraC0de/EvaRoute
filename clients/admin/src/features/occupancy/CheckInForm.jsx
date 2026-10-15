import NumberStepper from "./NumberStepper";

/**
 * "New check-in" form (demo data — see OccupancyPage).
 *
 * Mirrors the server's check-in contract in shape (family name + one entry
 * per person with an age group) so wiring it to the API later is a data-layer
 * change only.
 */
const CheckInForm = ({
  householdName,
  adults,
  children,
  remaining,
  onNameChange,
  onAdultsChange,
  onChildrenChange,
  onSubmit,
}) => {
  const people = adults + children;
  const canCheckIn = householdName.trim() && people > 0 && people <= remaining;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canCheckIn) onSubmit();
      }}
      className="rounded-[18px] bg-white p-4 shadow-[0_8px_20px_rgba(40,60,100,0.08)]"
    >
      <h2 className="mb-2 text-[12px] font-bold text-[#35405e]">New check-in</h2>
      <label htmlFor="household-name" className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.5px] text-[#8290aa]">
        Household / family name
      </label>
      <input
        id="household-name"
        value={householdName}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="Enter family name"
        className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] placeholder:text-[#9aa4b8] focus:ring-2"
      />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <NumberStepper label="Adults" value={adults} onChange={onAdultsChange} />
        <NumberStepper label="Children" value={children} onChange={onChildrenChange} />
      </div>
      <button
        type="submit"
        disabled={!canCheckIn}
        className="mt-5 min-h-9 w-full rounded-xl bg-[#5269ef] px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-[#4058df] disabled:cursor-not-allowed disabled:bg-[#aeb9ee]"
      >
        Check in household · {people} people
      </button>
      {householdName.trim() && people > remaining && (
        <p role="status" className="mt-2 text-[9px] text-[#b54b4b]">Not enough capacity for this household.</p>
      )}
    </form>
  );
};

export default CheckInForm;
