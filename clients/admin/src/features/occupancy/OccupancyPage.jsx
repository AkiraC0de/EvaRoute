import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import useAsyncAction from "../../hooks/useAsyncAction";
import useStays from "../../hooks/useStays";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../app/roles";
import CheckInTicket from "./CheckInTicket";
import FacilityPicker from "./FacilityPicker";
import OccupancyGrid from "./OccupancyGrid";
import OccupancyMeter from "./OccupancyMeter";
import OccupancySummary from "./OccupancySummary";
import useActivityStats from "../../hooks/useActivityStats";
import { OccupancyLoading, OccupancyEmpty, OccupancyError } from "./OccupancyStates";
import useOccupancyFacilities from "./useOccupancyFacilities";

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

  const { facilities, facilitiesLoading, facilityId, setFacilityId } = useOccupancyFacilities(isAdmin);
  const [ticketStay, setTicketStay] = useState(null); // successful check-in -> ticket
  const { busy, run } = useAsyncAction();

  const { stays, occupancy, loading, error, retry, checkIn, checkOut } = useStays(facilityId);

  // 14 days of per-day check-ins (two 7-day windows) for the meter's trend
  // chart and delta pill — scoped to the selected facility.
  const trendFrom = new Date();
  trendFrom.setDate(trendFrom.getDate() - 13);
  const { timeline } = useActivityStats({
    from: trendFrom.toISOString(),
    interval: "day",
    ...(facilityId ? { facilityId } : {}),
  });

  return (
    <div>
      <PageHeader title="Occupancy" subtitle="Check evacuees in and out of a facility" />

      {isAdmin && facilities.length > 0 && (
        <FacilityPicker
          facilities={facilities}
          value={facilityId}
          onChange={(event) => setFacilityId(event.target.value)}
        />
      )}

      {facilitiesLoading && <OccupancyLoading />}

      {!facilitiesLoading && !facilityId && !loading && <OccupancyEmpty isAdmin={isAdmin} />}

      {facilityId && loading && <OccupancyLoading />}

      {facilityId && error && <OccupancyError error={error} onRetry={retry} />}

      {facilityId && !loading && !error && occupancy && (
        <>
          <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <OccupancyMeter occupancy={occupancy.members} capacity={occupancy.maxCapacity} timeline={timeline} />
            <OccupancySummary occupancy={occupancy} />
          </div>

          <OccupancyGrid
            facilityId={facilityId}
            occupancy={occupancy}
            stays={stays}
            busy={busy}
            onCheckIn={async (payload) => {
              // The form owns busy/error handling; on success the server's
              // stay record (with the real Check-In ID) opens the ticket.
              const stay = await checkIn(payload);
              if (stay) setTicketStay(stay);
            }}
            onCheckOut={(stay) => run(() => checkOut(stay.id))}
          />
        </>
      )}

      {ticketStay && <CheckInTicket stay={ticketStay} onClose={() => setTicketStay(null)} />}
    </div>
  );
};

export default OccupancyPage;
