import { useState } from "react";
import Banner from "../../components/ui/Banner";
import useAsyncAction from "../../hooks/useAsyncAction";

/**
 * Check-in form for one household. Mirrors the server contract
 * (POST /api/v1/facility/:facilityId/stay):
 *   { familyName, members: [{ fullName, ageGroup: "CHILD" | "ADULT" }] }
 * One row per person — the API stores every family member's name and
 * category. Capacity is enforced server-side; remaining slots are shown so
 * the operator sees the limit before submitting.
 */

const emptyMember = () => ({ fullName: "", ageGroup: "ADULT" });

const CheckInForm = ({ remaining, onCheckIn }) => {
  const { busy, error, run } = useAsyncAction();
  const [familyName, setFamilyName] = useState("");
  const [members, setMembers] = useState([emptyMember()]);

  const updateMember = (index, patch) =>
    setMembers((current) =>
      current.map((member, i) => (i === index ? { ...member, ...patch } : member)),
    );

  const submit = () =>
    run(async () => {
      await onCheckIn({
        familyName: familyName.trim(),
        members: members.map((member) => ({
          fullName: member.fullName.trim(),
          ageGroup: member.ageGroup,
        })),
      });
      setFamilyName("");
      setMembers([emptyMember()]);
    });

  const people = members.length;
  const incomplete = members.some((member) => !member.fullName.trim()) || !familyName.trim();
  const overCapacity = people > remaining;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!incomplete && !overCapacity) submit();
      }}
      className="rounded-[18px] bg-white p-4 shadow-[0_8px_20px_rgba(40,60,100,0.08)]"
    >
      <h2 className="mb-2 text-[12px] font-bold text-[#35405e]">New check-in</h2>

      <label htmlFor="household-name" className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.5px] text-[#8290aa]">
        Household / family name
      </label>
      <input
        id="household-name"
        value={familyName}
        onChange={(event) => setFamilyName(event.target.value)}
        placeholder="Enter family name"
        className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] placeholder:text-[#9aa4b8] focus:ring-2"
      />

      <p className="mb-1 mt-3 text-[8px] font-semibold uppercase tracking-[0.5px] text-[#8290aa]">
        Family members
      </p>
      <ul className="space-y-2">
        {members.map((member, index) => (
          <li key={index} className="flex items-center gap-2">
            <input
              value={member.fullName}
              onChange={(event) => updateMember(index, { fullName: event.target.value })}
              placeholder="Full name"
              aria-label={`Member ${index + 1} full name`}
              className="h-9 min-w-0 flex-1 rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] placeholder:text-[#9aa4b8] focus:ring-2"
            />
            <select
              value={member.ageGroup}
              onChange={(event) => updateMember(index, { ageGroup: event.target.value })}
              aria-label={`Member ${index + 1} category`}
              className="h-9 rounded-xl bg-[#f3f5fa] px-2 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] focus:ring-2"
            >
              <option value="ADULT">Adult</option>
              <option value="CHILD">Child</option>
            </select>
            <button
              type="button"
              aria-label={`Remove member ${index + 1}`}
              disabled={members.length === 1}
              onClick={() =>
                setMembers((current) => current.filter((_, i) => i !== index))
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3f5fa] text-[#8290aa] transition hover:bg-[#fbe4e3] hover:text-[#d8322d] disabled:opacity-40"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setMembers((current) => [...current, emptyMember()])}
        className="mt-2 text-[9px] font-semibold text-[#5269ef] transition hover:text-[#4058df]"
      >
        + Add family member
      </button>

      {error && (
        <div className="mt-3">
          <Banner tone="error">{error}</Banner>
        </div>
      )}
      {overCapacity && (
        <p role="status" className="mt-2 text-[9px] text-[#b54b4b]">
          Not enough capacity for this household ({people} people, {remaining} slot{remaining === 1 ? "" : "s"} left).
        </p>
      )}

      <button
        type="submit"
        disabled={busy || incomplete || overCapacity}
        className="mt-4 min-h-9 w-full rounded-xl bg-[#5269ef] px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-[#4058df] disabled:cursor-not-allowed disabled:bg-[#aeb9ee]"
      >
        {busy ? "Checking in…" : `Check in household · ${people} ${people === 1 ? "person" : "people"}`}
      </button>
    </form>
  );
};

export default CheckInForm;
