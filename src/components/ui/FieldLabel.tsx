export function FieldLabel({ label, labelHe }: { label: string; labelHe?: string }) {
  return (
    <div className="mb-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/50">{label}</span>
      {labelHe && (
        <div className="mt-0.5 text-base font-medium text-navy-mid/75" dir="rtl">
          {labelHe}
        </div>
      )}
    </div>
  );
}
