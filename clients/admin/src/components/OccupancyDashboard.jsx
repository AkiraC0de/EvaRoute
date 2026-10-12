import { useState } from "react";

const CAPACITY = 400;

const initialHouseholds = [
  { id: 1, name: "Dela Cruz Family", adults: 3, children: 2 },
  { id: 2, name: "Santos Family", adults: 2, children: 1 },
  { id: 3, name: "Bautista Family", adults: 4, children: 2 },
];

const Counter = ({ label, value, onChange }) => (
  <div>
    <label className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
      {label}
    </label>
    <div className="flex h-9 items-center justify-between rounded-full bg-[#f3f5fa] p-1 shadow-inner">
      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()}`}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[14px] font-semibold text-[#5269ef] shadow-sm hover:bg-[#e8edff]"
      >
        -
      </button>
      <span className="min-w-6 text-center text-[10px] font-bold text-[#35405e]">{value}</span>
      <button
        type="button"
        aria-label={`Increase ${label.toLowerCase()}`}
        onClick={() => onChange(value + 1)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[14px] font-semibold text-[#5269ef] shadow-sm hover:bg-[#e8edff]"
      >
        +
      </button>
    </div>
  </div>
);

const OccupancyDashboard = () => {
  const [adults, setAdults] = useState(275);
  const [children, setChildren] = useState(37);
  const [familyCount, setFamilyCount] = useState(68);
  const [households, setHouseholds] = useState(initialHouseholds);
  const [nextId, setNextId] = useState(4);
  const [householdName, setHouseholdName] = useState("Navea Family");
  const [checkInAdults, setCheckInAdults] = useState(2);
  const [checkInChildren, setCheckInChildren] = useState(3);

  const occupancy = adults + children;
  const remaining = Math.max(0, CAPACITY - occupancy);
  const percentage = Math.round((occupancy / CAPACITY) * 100);
  const canCheckIn = householdName.trim() && checkInAdults + checkInChildren > 0 && checkInAdults + checkInChildren <= remaining;

  const checkInHousehold = (event) => {
    event.preventDefault();
    if (!canCheckIn) return;

    setAdults((current) => current + checkInAdults);
    setChildren((current) => current + checkInChildren);
    setFamilyCount((current) => current + 1);
    setHouseholds((current) => [
      { id: nextId, name: householdName.trim(), adults: checkInAdults, children: checkInChildren },
      ...current,
    ]);
    setNextId((current) => current + 1);
    setHouseholdName("");
  };

  const checkOutHousehold = (household) => {
    setHouseholds((current) => current.filter((item) => item.id !== household.id));
    setAdults((current) => Math.max(0, current - household.adults));
    setChildren((current) => Math.max(0, current - household.children));
    setFamilyCount((current) => Math.max(0, current - 1));
  };

  return (
    <main className="ml-49.5 min-h-screen bg-[#e9edf7] p-6 max-sm:ml-0 max-sm:p-4">
      <div className="min-h-[calc(100vh-48px)]">
        <header className="mb-3">
          <h1 className="text-[20px] font-bold text-[#273556]">Occupancy</h1>
          <p className="mt-0.5 text-[11px] text-[#8290aa]">
            Local demo data · capacity {CAPACITY}
          </p>
        </header>

        {/* NOT CONNECTED. The EvaRoute API exposes no occupancy, household or
            check-in/check-out endpoint: the FacilityStay / FacilityStayMember
            models exist in prisma/schema.prisma but no route reads or writes
            them. Everything below is in-page state and resets on reload. */}
        <div
          role="status"
          className="mb-4 rounded-[15px] bg-[#fff3d9] px-4 py-3 text-[10px] font-medium leading-relaxed text-[#a96a00]"
        >
          Demo screen — not saved. The API has no occupancy endpoints yet, so
          every figure and check-in below lives only in this page.
        </div>

        <section aria-label="Facility occupancy" className="mb-4 rounded-[18px] bg-white p-3 shadow-[0_8px_20px_rgba(40,60,100,0.08)] sm:p-4">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-[20px] font-bold text-[#303d5d]">{occupancy}</span>
            <span className="text-[11px] font-semibold text-[#8290aa]">/ {CAPACITY}</span>
            <span className="ml-auto rounded-full bg-[#fff3d9] px-2.5 py-1 text-[8px] font-bold text-[#a96a00]">● {percentage}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Facility capacity"
            aria-valuemin={0}
            aria-valuemax={CAPACITY}
            aria-valuenow={occupancy}
            className="h-2 overflow-hidden rounded-full bg-[#edf0f6]"
          >
            <div className="h-full rounded-full bg-[#f0b642] transition-[width]" style={{ width: `${percentage}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[8px] text-[#8995ad]">
            <span>0</span>
            <span>{CAPACITY} cap</span>
          </div>
        </section>

        <section aria-label="Occupancy breakdown" className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Families", value: familyCount },
            { label: "Adults", value: adults },
            { label: "Children", value: children },
            { label: "Left", value: remaining },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[15px] bg-[#f7f8fc] px-3 py-2 shadow-[inset_0_2px_5px_rgba(40,60,100,0.06)]">
              <p className="text-[15px] font-bold leading-5 text-[#35405e]">{stat.value}</p>
              <p className="mt-1 text-[7px] font-semibold uppercase tracking-[0.5px] text-[#7f8eab]">{stat.label}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-4 md:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.55fr)]">
          <form onSubmit={checkInHousehold} className="rounded-[18px] bg-white p-4 shadow-[0_8px_20px_rgba(40,60,100,0.08)]">
            <h2 className="mb-2 text-[12px] font-bold text-[#35405e]">New check-in</h2>
            <label htmlFor="household-name" className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.5px] text-[#8290aa]">
              Household / family name
            </label>
            <input
              id="household-name"
              value={householdName}
              onChange={(event) => setHouseholdName(event.target.value)}
              placeholder="Enter family name"
              className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] placeholder:text-[#9aa4b8] focus:ring-2"
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Counter label="Adults" value={checkInAdults} onChange={setCheckInAdults} />
              <Counter label="Children" value={checkInChildren} onChange={setCheckInChildren} />
            </div>
            <button
              type="submit"
              disabled={!canCheckIn}
              className="mt-5 min-h-9 w-full rounded-xl bg-[#5269ef] px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-[#4058df] disabled:cursor-not-allowed disabled:bg-[#aeb9ee]"
            >
              Check in household · {checkInAdults + checkInChildren} people
            </button>
            {householdName.trim() && checkInAdults + checkInChildren > remaining && (
              <p role="status" className="mt-2 text-[9px] text-[#b54b4b]">Not enough capacity for this household.</p>
            )}
          </form>

          <section className="rounded-[18px] bg-white p-4 shadow-[0_8px_20px_rgba(40,60,100,0.08)]">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-[12px] font-bold text-[#35405e]">Checked in today</h2>
              <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[8px] font-semibold text-[#7180a0] shadow-[0_3px_10px_rgba(40,60,100,0.1)]">
                {familyCount} households
              </span>
            </div>
            <ul className="max-h-47.5 space-y-2 overflow-y-auto pr-1">
              {households.map((household) => {
                const initials = household.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
                const people = household.adults + household.children;
                return (
                  <li key={household.id} className="flex min-h-12 items-center gap-3 rounded-xl bg-white px-2.5 py-2 shadow-[0_4px_10px_rgba(40,60,100,0.1)]">
                    <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8edff] text-[9px] font-bold text-[#5269ef]">
                      {initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-semibold text-[#35405e]">{household.name}</p>
                      <p className="text-[8px] text-[#8290aa]">{people} {people === 1 ? "member" : "members"}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Check out ${household.name}`}
                      onClick={() => checkOutHousehold(household)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f3f5fa] text-[#7180a0] transition hover:bg-[#e8edff] hover:text-[#5269ef]"
                    >
                      <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 17l5-5-5-5" />
                        <path d="M15 12H3" />
                        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                      </svg>
                    </button>
                  </li>
                );
              })}
              {households.length === 0 && <li className="py-8 text-center text-[10px] text-[#8290aa]">No households checked in today.</li>}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
};

export default OccupancyDashboard;