import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import CheckInForm from "./CheckInForm";
import HouseholdList from "./HouseholdList";
import OccupancyMeter from "./OccupancyMeter";
import StatTile from "./StatTile";

/**
 * Occupancy screen.
 *
 * NOT CONNECTED. The EvaRoute API exposes no occupancy, household or
 * check-in/check-out endpoint: the FacilityStay / FacilityStayMember
 * models exist in prisma/schema.prisma but no route reads or writes
 * them. Everything below is in-page state and resets on reload — kept
 * exactly as the original demo screen, now composed from small components.
 */

const CAPACITY = 400;

const initialHouseholds = [
  { id: 1, name: "Dela Cruz Family", adults: 3, children: 2 },
  { id: 2, name: "Santos Family", adults: 2, children: 1 },
  { id: 3, name: "Bautista Family", adults: 4, children: 2 },
];

const OccupancyPage = () => {
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

  const checkInHousehold = () => {
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
    <div className="min-h-[calc(100vh-48px)]">
      <PageHeader
        title="Occupancy"
        subtitle={`Local demo data · capacity ${CAPACITY}`}
        subtitleClassName="mt-0.5 text-[11px] text-[#8290aa]"
      />

      <div
        role="status"
        className="mb-4 rounded-[15px] bg-[#fff3d9] px-4 py-3 text-[10px] font-medium leading-relaxed text-[#a96a00]"
      >
        Demo screen — not saved. The API has no occupancy endpoints yet, so
        every figure and check-in below lives only in this page.
      </div>

      <OccupancyMeter occupancy={occupancy} capacity={CAPACITY} />

      <section aria-label="Occupancy breakdown" className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile label="Families" value={familyCount} />
        <StatTile label="Adults" value={adults} />
        <StatTile label="Children" value={children} />
        <StatTile label="Left" value={remaining} />
      </section>

      <div className="grid gap-4 md:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.55fr)]">
        <CheckInForm
          householdName={householdName}
          adults={checkInAdults}
          children={checkInChildren}
          remaining={remaining}
          onNameChange={setHouseholdName}
          onAdultsChange={setCheckInAdults}
          onChildrenChange={setCheckInChildren}
          onSubmit={checkInHousehold}
        />
        <HouseholdList households={households} onCheckOut={checkOutHousehold} />
      </div>
    </div>
  );
};

export default OccupancyPage;
