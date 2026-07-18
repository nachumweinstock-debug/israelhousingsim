import type { BorrowerProfile, BuyerCategory } from "../types";
import { useLang } from "../i18n";
import { NumberField } from "./ui/NumberField";
import { SelectField } from "./ui/SelectField";
import { CurrencyField } from "./ui/CurrencyField";

const BUYER_CATEGORY_VALUES: BuyerCategory[] = [
  "first_home",
  "replacement_home",
  "investment",
  "foreign_resident",
  "oleh_chadash",
];

export function ProfileForm({
  profile,
  onChange,
}: {
  profile: BorrowerProfile;
  onChange: (profile: BorrowerProfile) => void;
}) {
  const { t } = useLang();

  function set<K extends keyof BorrowerProfile>(key: K, value: BorrowerProfile[K]) {
    onChange({ ...profile, [key]: value });
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <CurrencyField
        label="Property price"
        labelHe="מחיר הנכס"
        value={profile.propertyPrice}
        onChange={(v) => set("propertyPrice", v)}
        min={200_000}
        max={10_000_000}
        step={10_000}
      />
      <CurrencyField
        label="Own equity"
        labelHe="הון עצמי"
        value={profile.ownEquity}
        onChange={(v) => set("ownEquity", v)}
        min={0}
        max={profile.propertyPrice || 10_000_000}
        step={10_000}
      />
      <SelectField
        label="Buyer category"
        labelHe="קטגוריית רוכש"
        value={profile.buyerCategory}
        onChange={(v) => set("buyerCategory", v as BuyerCategory)}
        options={BUYER_CATEGORY_VALUES.map((v) => ({
          value: v,
          label: t.wizard.categoryOptions[v].label,
        }))}
      />
      <CurrencyField
        label="Combined monthly net income"
        labelHe="הכנסה נטו חודשית"
        value={profile.monthlyNetIncome}
        onChange={(v) => set("monthlyNetIncome", v)}
        min={0}
        max={100_000}
        step={500}
      />
      <NumberField
        label="Age of older borrower"
        labelHe="גיל הלווה המבוגר"
        value={profile.olderBorrowerAge}
        onChange={(v) => set("olderBorrowerAge", v)}
        unit="yrs"
        min={18}
        max={90}
      />
      <CurrencyField
        label="Existing monthly debt"
        labelHe="החזר חודשי קיים"
        value={profile.existingMonthlyDebt}
        onChange={(v) => set("existingMonthlyDebt", v)}
        min={0}
        max={50_000}
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
    </div>
  );
}
