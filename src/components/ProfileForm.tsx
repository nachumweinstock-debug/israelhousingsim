import type { BorrowerProfile, BuyerCategory } from "../types";
import { NumberField } from "./ui/NumberField";
import { SelectField } from "./ui/SelectField";

const BUYER_CATEGORIES: Array<{ value: BuyerCategory; label: string }> = [
  { value: "first_home", label: "First home" },
  { value: "replacement_home", label: "Replacement home" },
  { value: "investment", label: "Investment / additional home" },
  { value: "foreign_resident", label: "Foreign resident" },
  { value: "oleh_chadash", label: "Oleh chadash" },
];

export function ProfileForm({
  profile,
  onChange,
}: {
  profile: BorrowerProfile;
  onChange: (profile: BorrowerProfile) => void;
}) {
  function set<K extends keyof BorrowerProfile>(key: K, value: BorrowerProfile[K]) {
    onChange({ ...profile, [key]: value });
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <NumberField
        label="Property price"
        labelHe="מחיר הנכס"
        value={profile.propertyPrice}
        onChange={(v) => set("propertyPrice", v)}
        unit="₪"
        min={0}
        step={10000}
      />
      <NumberField
        label="Own equity"
        labelHe="הון עצמי"
        value={profile.ownEquity}
        onChange={(v) => set("ownEquity", v)}
        unit="₪"
        min={0}
        step={10000}
      />
      <SelectField
        label="Buyer category"
        value={profile.buyerCategory}
        onChange={(v) => set("buyerCategory", v as BuyerCategory)}
        options={BUYER_CATEGORIES}
      />
      <NumberField
        label="Combined monthly net income"
        labelHe="הכנסה נטו חודשית"
        value={profile.monthlyNetIncome}
        onChange={(v) => set("monthlyNetIncome", v)}
        unit="₪/mo"
        min={0}
        step={500}
      />
      <NumberField
        label="Age of older borrower"
        value={profile.olderBorrowerAge}
        onChange={(v) => set("olderBorrowerAge", v)}
        unit="yrs"
        min={18}
        max={90}
      />
      <NumberField
        label="Existing monthly debt"
        labelHe="החזר חודשי קיים"
        value={profile.existingMonthlyDebt}
        onChange={(v) => set("existingMonthlyDebt", v)}
        unit="₪/mo"
        min={0}
        step={100}
      />
      <NumberField
        label="Requested term"
        labelHe="תקופת ההלוואה"
        value={profile.requestedTermYears}
        onChange={(v) => set("requestedTermYears", v)}
        unit="yrs"
        min={1}
        max={30}
      />
      {profile.buyerCategory === "oleh_chadash" && (
        <NumberField
          label="Years since aliyah"
          value={profile.yearsSinceAliyah ?? 0}
          onChange={(v) => set("yearsSinceAliyah", v)}
          unit="yrs"
          min={0}
          max={30}
        />
      )}
    </div>
  );
}
