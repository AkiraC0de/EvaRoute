import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Button from "../../components/ui/Button";
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
import SectionHeader from "./SectionHeader";
import useActivityStats from "../../hooks/useActivityStats";
import { OccupancyLoading, OccupancyEmpty, OccupancyError } from "./OccupancyStates";
import useOccupancyFacilities from "./useOccupancyFacilities";
import ExportCheckInsModal from "./ExportCheckInsModal";
import { BAND_COLS } from "./occupancyUtils";

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
  const [exportOpen, setExportOpen] = useState(false); // export dialog
  const selectedFacility = facilities.find((facility) => facility.id === facilityId) ?? null;
  const { busy, run } = useAsyncAction();

  const { stays, occupancy, loading, error, retry, checkIn, checkOut } = useStays(facilityId);

  // 14 days of per-day check-ins (two 7-day windows) for the meter's trend
  // chart and delta pill — scoped to the selected facility. MEMOIZED: the
  // hook keys its cache on JSON.stringify(query), so an inline `new Date()`
  // would change the key every render and refetch forever (and the timeline
  // would never settle). One stable query per facility.
  const trendQuery = useMemo(() => {
    const trendFrom = new Date();
    trendFrom.setDate(trendFrom.getDate() - 13);
    return {
      from: trendFrom.toISOString(),
      interval: "day",
      ...(facilityId ? { facilityId } : {}),
    };
  }, [facilityId]);
  const { timeline } = useActivityStats(trendQuery);

  // Entrance for the page bands (existing admin motion convention:
  // motion/react + useReducedMotion guards).
  const reduceMotion = useReducedMotion();
  const rise = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1], delay },
        };

  return (
    <div>
      {/* Header row: title block left, facility picker inline right (ADMIN) */}
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Occupancy" subtitle="Check evacuees in and out of a facility" />

        {isAdmin && facilities.length > 0 && (
          <FacilityPicker
            facilities={facilities}
            value={facilityId}
            onChange={(event) => setFacilityId(event.target.value)}
          />
        )}
      </header>

      {facilitiesLoading && <OccupancyLoading />}

      {!facilitiesLoading && !facilityId && !loading && <OccupancyEmpty isAdmin={isAdmin} />}

      {facilityId && loading && <OccupancyLoading />}

      {facilityId && error && <OccupancyError error={error} onRetry={retry} />}

      {facilityId && !loading && !error && occupancy && (
        <div>
          {/* Overview band header + export entry point */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SectionHeader
              title="Occupancy overview"
              caption="Live numbers for the selected facility"
            />
            {occupancy && (
              <Button variant="neutral" size="sm" onClick={() => setExportOpen(true)}>
                <Download size={12} strokeWidth={2} className="mr-1" /> Export data
              </Button>
            )}
          </div>
          {/* Hero band: the occupancy hero beside the 2×2 metric wall */}
          <motion.div {...rise()} className={`mt-3 grid items-stretch gap-4 ${BAND_COLS}`}>
            <OccupancyMeter occupancy={occupancy.members} capacity={occupancy.maxCapacity} timeline={timeline} />
            <OccupancySummary occupancy={occupancy} stays={stays} />
          </motion.div>

          {/* Separator + operations heading, then the operational band */}
          <SectionHeader
            top
            title="Occupancy operations"
            caption="Check evacuees in and out and manage households"
          />
          <motion.div {...rise(0.08)} className="mt-3">
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
          </motion.div>
        </div>
      )}

      {ticketStay && <CheckInTicket stay={ticketStay} onClose={() => setTicketStay(null)} />}

      {exportOpen && occupancy && (
        <ExportCheckInsModal
          stays={stays}
          occupancy={occupancy}
          facility={selectedFacility}
          user={user}
          onClose={() => setExportOpen(false)}
        />
      )}
    </div>
  );
};

export default OccupancyPage;
