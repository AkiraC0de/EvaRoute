import { Building2 } from "lucide-react";

/**
 * Facility identity bar: icon, name, capacity and availability pill, plus the
 * filter buttons inherited from the original design (they have no onClick
 * handler and no matching API parameter, so they remain decorative — see the
 * report).
 */
const FacilitySummaryBar = ({ facility, available }) => (
  <div className="mb-5 flex min-h-20.5 flex-wrap items-center justify-between gap-3 rounded-[20px] bg-white px-5 shadow-[0_8px_20px_rgba(40,60,100,0.08)]">
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf1ff]">
        <Building2 size={20} strokeWidth={1.8} className="text-[#4e6af3]" />
      </div>

      <div>
        <h2 className="text-[13px] font-bold text-[#34405f]">{facility.name}</h2>
        <p className="text-[9px] text-[#8995ad]">
          Capacity {facility.maxCapacity}
        </p>
      </div>

      <div className="ml-3 flex items-center gap-2 rounded-full bg-[#f7f8fc] px-4 py-2">
        <span
          className={`h-2 w-2 rounded-full ${available ? "bg-[#42c98b]" : "bg-[#e5a83c]"}`}
        />
        <span className="text-[9px] font-medium text-[#65718c]">
          {available ? "Available" : "Unavailable"}
        </span>
      </div>
    </div>

    {/* Filter controls inherited from the original design. They have no
        onClick handler in the imported source and no matching API
        parameter, so they remain decorative (see the report). */}
    <div className="flex items-center gap-2">
      <button className="rounded-xl bg-[#5269ef] px-7 py-2.5 text-[9px] font-semibold text-white shadow-sm transition hover:bg-[#4058df]">
        All
      </button>
      <button className="rounded-xl bg-[#f7f8fc] px-5 py-2.5 text-[9px] font-semibold text-[#8290aa] transition hover:bg-white hover:text-[#5269ef]">
        Limited
      </button>
      <button className="rounded-xl bg-[#f7f8fc] px-5 py-2.5 text-[9px] font-semibold text-[#8290aa] transition hover:bg-white hover:text-[#5269ef]">
        Availability
      </button>
    </div>
  </div>
);

export default FacilitySummaryBar;
