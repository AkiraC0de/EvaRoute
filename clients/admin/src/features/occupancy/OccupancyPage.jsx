import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatTile from "../../components/ui/StatTile";
import StatusPanel from "../../components/ui/StatusPanel";
import { SelectField } from "../../components/ui/Field";
import useAsyncAction from "../../hooks/useAsyncAction";
import useStays from "../../hooks/useStays";
import * as api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../app/roles";
import CheckInForm from "./CheckInForm";
import HouseholdList from "./HouseholdList";
import OccupancyMeter from "./OccupancyMeter";

/**
 * Occupancy — real check-in / check-out against the stay API.
 *
 * FACILITY_STAFF operate on their assigned facility only (assertFacilityAccess
 * enforces it server-side too). ADMIN picks which facility to operate on from
 * a picker fed by GET /facility.
 */
const OccupancyPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [facilities, setFacilities] = useState([]);
  const [facilityId, setFacilityId] = useState(null);
  const { busy, run } = useAsyncAction();

  const { stays, occupancy, loading, error, retry, checkIn, checkOut } = useStays(facilityId);

  // ADMIN: load the facility picker options. FACILITY_STAFF: resolve their
  // assigned facility (the server returns `{ facility }` for staff).
  useEffect(() => {
    let cancelled = false;

    api
      .listFacilities()
      .then((rows) => {
        if (cancelled) return;
        setFacilities(rows);
        if (!isAdmin && rows.length > 0) setFacilityId(rows[0].id);
        if (isAdmin && rows.length > 0) setFacilityId((current) => current ?? rows[0].id);
      })
      .catch(() => {
        // Handled by the stays error state below if the facility cannot load.
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  return (
    <div>
      <PageHeader title="Occupancy" subtitle="Check evacuees in and out of a facility" />

      {isAdmin && facilities.length > 0 && (
        <div className="mb-4 w-full max-w-[320px]">
          <SelectField
            label="Facility"
            value={facilityId ?? ""}
            onChange={(event) => setFacilityId(event.target.value)}
          >
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.name} · {facility.address}
              </option>
            ))}
          </SelectField>
        </div>
      )}

      {!facilityId && !loading && (
        <StatusPanel tone="empty" title="No facility available">
          {isAdmin
            ? "Register a facility first — occupancy works per facility."
            : "Your account is not assigned to a facility yet. Ask an administrator to assign you."}
        </StatusPanel>
      )}

      {facilityId && loading && (
        <StatusPanel title="Loading occupancy…">
          Fetching checked-in households from the EvaRoute API.
        </StatusPanel>
      )}

      {facilityId && error && (
        <StatusPanel tone="error" title="Could not load occupancy" onRetry={retry}>
          {error.message}
        </StatusPanel>
      )}

      {facilityId && !loading && !error && occupancy && (
        <>
          <OccupancyMeter occupancy={occupancy.members} capacity={occupancy.maxCapacity} />

          <section aria-label="Occupancy breakdown" className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatTile label="Families" value={occupancy.families} />
            <StatTile label="Adults" value={occupancy.adults} />
            <StatTile label="Children" value={occupancy.children} />
            <StatTile label="Left" value={occupancy.remaining} icon={<Users size={13} strokeWidth={1.9} />} />
          </section>

          <div className="grid gap-4 md:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.55fr)]">
            <CheckInForm
              remaining={occupancy.remaining}
              onCheckIn={async (payload) => {
                await run(() => checkIn(payload));
              }}
            />
            <HouseholdList
              stays={stays}
              busy={busy}
              onCheckOut={(stay) => run(() => checkOut(stay.id))}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default OccupancyPage;
