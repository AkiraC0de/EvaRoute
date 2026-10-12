const ProfileField = ({ label, value }) => (
  <label className="block">
    <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.7px] text-[#7f8eae]">
      {label}
    </span>
    <input
      aria-label={label}
      className="h-8 w-full rounded-xl bg-[#f6f8fc] px-3 text-[10px] font-semibold text-[#2f3d5f] shadow-[inset_0_2px_5px_rgba(40,55,90,0.12)] outline-none"
      readOnly
      value={value}
    />
  </label>
);

export default ProfileField;
