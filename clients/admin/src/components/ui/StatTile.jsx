/**
 * Small stat tile for breakdown grids (occupancy breakdown, admin overview).
 */
const StatTile = ({ label, value }) => (
  <div className="rounded-[15px] bg-[#f7f8fc] px-3 py-2 shadow-[inset_0_2px_5px_rgba(40,60,100,0.06)]">
    <p className="text-[15px] font-bold leading-5 text-[#35405e]">{value}</p>
    <p className="mt-1 text-[7px] font-semibold uppercase tracking-[0.5px] text-[#7f8eab]">{label}</p>
  </div>
);

export default StatTile;
