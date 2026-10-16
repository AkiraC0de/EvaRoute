import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import StatusPanel from "../../components/ui/StatusPanel";
import { SelectField } from "../../components/ui/Field";
import useAsyncAction from "../../hooks/useAsyncAction";
import useStays from "../../hooks/useStays";
import * as api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../app/roles";
import CheckInForm from "./CheckInForm";
import CheckInTicket from "./CheckInTicket";
import HouseholdList from "./HouseholdList";
import OccupancyMeter from "./OccupancyMeter";
import OccupancySummary from "./OccupancySummary";
import { OccupancyLoading } from "./OccupancyStates";
import RecentHouseholdActivity from "./RecentHouseholdActivity";

/**
 * Occupancy — the staff operational dashboard: live occupancy numbers,
 * capacity visualization, household check-in/lookup, the checked-in
 * household list and the recent check-in / check-out trail.
 *
 * FACILITY_STAFF operate on their assigned facility only (assertFacilityAccess
 * enforces it server-side too). ADMIN picks which facility to operate on from
 * a picker fed by GET /facility.
 *
 * This component owns data flow and composition; metrics, the meter, search,
 * the household list, recent activity and the check-in ticket each live in
 * their own module.
 */
const OccupancyPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [facilities, setFacilities] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [facilityId, setFacilityId] = useState(null);
  const [ticketStay, setTicketStay] = useState(null); // successful check-in -> ticket
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
      })
      .finally(() => {
        if (!cancelled) setFacilitiesLoading(false);
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
                {`${facility.name} - ${facility.address}`}
              </option>
            ))}
          </SelectField>
        </div>
      )}

      {facilitiesLoading && <OccupancyLoading />}

      {!facilitiesLoading && !facilityId && !loading && (
        <StatusPanel tone="empty" title="No facility available">
          {isAdmin
            ? "Register a facility first — occupancy works per facility."
            : "Your account is not assigned to a facility yet. Ask an administrator to assign you."}
        </StatusPanel>
      )}

      {facilityId && loading && <OccupancyLoading />}

      {facilityId && error && (
        <StatusPanel tone="error" title="Could not load occupancy" onRetry={retry}>
          {error.message}
        </StatusPanel>
      )}

      {facilityId && !loading && !error && occupancy && (
        <>
          <OccupancySummary occupancy={occupancy} />
          <OccupancyMeter occupancy={occupancy.members} capacity={occupancy.maxCapacity} />

          {/* Operational grid: check-in form + recent movement in the left
              column, the household list spanning both rows on the right so it
              gets the full height. Stacks on small screens (form, recent,
              list) via the responsive columns breakpoint. */}
          <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.4fr)] lg:grid-rows-[auto_1fr]">
            <div className="lg:col-start-1 lg:row-start-1">
              <CheckInForm
                remaining={occupancy.remaining}
                onCheckIn={async (payload) => {
                  // The form owns busy/error handling; on success the server's
                  // stay record (with the real Check-In ID) opens the ticket.
                  const stay = await checkIn(payload);
                  if (stay) setTicketStay(stay);
                }}
              />
            </div>
            <div className="lg:col-start-1 lg:row-start-2">
              <RecentHouseholdActivity facilityId={facilityId} />
            </div>
            <div className="flex lg:col-start-2 lg:row-start-1 lg:row-span-2">
              <HouseholdList
                stays={stays}
                busy={busy}
                onCheckOut={(stay) => run(() => checkOut(stay.id))}
              />
            </div>
          </div>
        </>
      )}

      {ticketStay && <CheckInTicket stay={ticketStay} onClose={() => setTicketStay(null)} />}
    </div>
  );
};

export default OccupancyPage;
