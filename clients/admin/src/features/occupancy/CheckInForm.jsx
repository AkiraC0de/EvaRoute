import { useState } from "react";
import { Baby, UserPlus, X } from "lucide-react";
import Banner from "../../components/ui/Banner";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import TextField, { SelectField } from "../../components/ui/Field";
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

/** Quick-add buttons: one tap appends N members already categorised. */
const ADD_OPTIONS = [
  { label: "Add adult", count: 1, ageGroup: "ADULT" },
  { label: "Add child", count: 1, ageGroup: "CHILD" },
  { label: "Add 2 adults", count: 2, ageGroup: "ADULT" },
  { label: "Add 2 children", count: 2, ageGroup: "CHILD" },
];

const CheckInForm = ({ remaining, onCheckIn }) => {
  const { busy, error, run } = useAsyncAction();
  const [familyName, setFamilyName] = useState("");
  const [members, setMembers] = useState([emptyMember()]);

  const updateMember = (index, patch) =>
    setMembers((current) =>
      current.map((member, i) => (i === index ? { ...member, ...patch } : member)),
    );

  const addMembers = (count, ageGroup) =>
    setMembers((current) => [
      ...current,
      ...Array.from({ length: count }, () => ({ fullName: "", ageGroup })),
    ]);

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
    <Card
      className="max-h-max"
      as="form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!incomplete && !overCapacity) submit();
      }}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-clay-sm bg-accent-soft text-accent"
        >
          <UserPlus size={15} strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[13px] font-bold text-ink-soft">New check-in</h2>
          <p className="text-[10px] text-muted">One household per check-in</p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-sunken px-2.5 py-1 text-[10px] font-semibold text-muted shadow-clay-inset">
          {remaining} place{remaining === 1 ? "" : "s"} left
        </span>
      </div>

      <TextField
        id="household-name"
        label="Household / family name"
        value={familyName}
        onChange={(event) => setFamilyName(event.target.value)}
        placeholder="Enter family name"
      />

      <p className="mb-1 mt-3 text-[10px] font-semibold uppercase tracking-[0.5px] text-muted">
        Family members
      </p>
      <ul className="space-y-2 rounded-clay-sm bg-sunken p-2 shadow-clay-inset">
        {members.map((member, index) => (
          <li key={index} className="flex items-end gap-2">
            <TextField
              className="min-w-0 flex-1"
              label={index === 0 ? "Full name" : undefined}
              value={member.fullName}
              onChange={(event) => updateMember(index, { fullName: event.target.value })}
              placeholder={index === 0 ? "Full name" : `Member ${index + 1} full name`}
              aria-label={`Member ${index + 1} full name`}
            />
            <SelectField
              className="w-28 shrink-0"
              label={index === 0 ? "Category" : undefined}
              value={member.ageGroup}
              onChange={(event) => updateMember(index, { ageGroup: event.target.value })}
              aria-label={`Member ${index + 1} category`}
            >
              <option value="ADULT">Adult</option>
              <option value="CHILD">Child</option>
            </SelectField>
            <button
              type="button"
              aria-label={`Remove member ${index + 1}`}
              disabled={members.length === 1}
              onClick={() =>
                setMembers((current) => current.filter((_, i) => i !== index))
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-clay-sm bg-sunken text-muted shadow-clay-inset transition hover:bg-danger-soft hover:text-danger disabled:opacity-40"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {ADD_OPTIONS.map((option) => {
          const Icon = option.ageGroup === "CHILD" ? Baby : UserPlus;
          return (
            <button
              key={option.label}
              type="button"
              aria-label={option.label}
              onClick={() => addMembers(option.count, option.ageGroup)}
              className="inline-flex h-8 items-center gap-1 rounded-clay-sm bg-sunken px-2.5 text-[11px] font-semibold text-ink-soft shadow-clay-inset transition hover:bg-accent-soft hover:text-accent"
            >
              <Icon size={12} strokeWidth={2} aria-hidden="true" /> {option.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-3">
          <Banner tone="error">{error}</Banner>
        </div>
      )}
      {overCapacity && (
        <p role="status" className="mt-2 text-[11px] text-danger">
          Not enough capacity for this household ({people} people, {remaining} place{remaining === 1 ? "" : "s"} left).
        </p>
      )}

      <Button type="submit" disabled={busy || incomplete || overCapacity} className="mt-4 min-h-9 w-full" size="sm">
        {busy ? "Checking in…" : `Check in household · ${people} ${people === 1 ? "person" : "people"}`}
      </Button>
    </Card>
  );
};

export default CheckInForm;
