import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { ContinueButton, QuestionShell, Reveal } from "../components/QuestionShell";
import { AmountSlider } from "../components/inputs/AmountSlider";
import { PercentSlider } from "../components/inputs/PercentSlider";
import { ChoiceCard } from "../components/inputs/ChoiceCard";
import { formatShekels } from "../lib/mortgageMath";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";
import { useSimLang } from "../state/useSimLang";

export function InvestorCashFlow() {
  const buyerStatus = useSimulatorStore((state) => state.buyerStatus);
  const investor = useSimulatorStore((state) => state.investor);
  const setInvestor = useSimulatorStore((state) => state.setInvestor);
  const { goNext } = useFlowNav();
  const { s } = useSimLang();
  const [showVacancy, setShowVacancy] = useState(investor.vacancyMonths > 0);

  // This branch only exists for investment property buyers, anyone else
  // lands on the next step, same pattern as existingHomeStatus.tsx.
  if (buyerStatus !== "investment") {
    return <Navigate to="/simulator/creditStanding" replace />;
  }

  return (
    <QuestionShell
      wide
      title={s.investor.title}
      helper={s.investor.helper}
      footer={<ContinueButton label={s.common.continueLabel} onClick={goNext} />}
    >
      <Reveal className="rounded-3xl border border-hairline bg-card p-7 shadow-lift">
        <p className="mb-1 text-[15px] font-semibold text-ink">{s.investor.rentLabel}</p>
        <p className="mb-4 text-[13px] leading-snug text-inkMuted">{s.investor.rentNote}</p>
        <AmountSlider
          ariaLabel={s.investor.rentLabel}
          value={investor.monthlyRent}
          onChange={(monthlyRent) => setInvestor({ monthlyRent })}
          min={0}
          max={40_000}
          step={100}
          format={formatShekels}
          editable
        />
      </Reveal>

      <Reveal className="rounded-3xl border border-hairline bg-card p-7 shadow-lift">
        <p className="mb-1 text-[15px] font-semibold text-ink">{s.investor.insuranceLabel}</p>
        <p className="mb-4 text-[13px] leading-snug text-inkMuted">{s.investor.insuranceNote}</p>
        <AmountSlider
          ariaLabel={s.investor.insuranceLabel}
          value={investor.buildingInsuranceAnnual}
          onChange={(buildingInsuranceAnnual) => setInvestor({ buildingInsuranceAnnual })}
          min={0}
          max={15_000}
          step={100}
          format={formatShekels}
          editable
        />
      </Reveal>

      <Reveal className="rounded-3xl border border-hairline bg-card p-6 shadow-lift">
        <p className="mb-3 text-[15px] font-semibold text-ink">{s.investor.managementToggle}</p>
        <div className="grid grid-cols-2 gap-3">
          <ChoiceCard
            index={0}
            title={s.common.yes}
            selected={investor.useManagementCompany}
            dimmed={!investor.useManagementCompany}
            onSelect={() => setInvestor({ useManagementCompany: true })}
          />
          <ChoiceCard
            index={1}
            title={s.common.no}
            selected={!investor.useManagementCompany}
            dimmed={investor.useManagementCompany}
            onSelect={() => setInvestor({ useManagementCompany: false })}
          />
        </div>
        <AnimatePresence>
          {investor.useManagementCompany ? (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 20 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-semibold text-inkMuted">
                  {s.investor.managementFeeLabel}
                </p>
                <p className="text-[15px] font-bold tabular-nums text-ink" dir="ltr">
                  {investor.managementFeePct}%
                </p>
              </div>
              <div className="mt-3">
                <PercentSlider
                  compact
                  ariaLabel={s.investor.managementFeeLabel}
                  value={investor.managementFeePct}
                  onChange={(managementFeePct) => setInvestor({ managementFeePct })}
                  min={0}
                  max={15}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Reveal>

      <Reveal className="rounded-3xl border border-hairline bg-card p-6 shadow-lift">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[15px] font-semibold text-ink">{s.investor.maintenanceLabel}</p>
          <p className="text-[15px] font-bold tabular-nums text-ink" dir="ltr">
            {investor.maintenancePct}%
          </p>
        </div>
        <p className="mb-3 mt-1 text-[13px] leading-snug text-inkMuted">{s.investor.maintenanceNote}</p>
        <PercentSlider
          compact
          ariaLabel={s.investor.maintenanceLabel}
          value={investor.maintenancePct}
          onChange={(maintenancePct) => setInvestor({ maintenancePct })}
          min={0}
          max={20}
        />
      </Reveal>

      <Reveal className="rounded-3xl border border-hairline bg-card p-6 shadow-lift">
        <button
          type="button"
          onClick={() => {
            const next = !showVacancy;
            setShowVacancy(next);
            if (!next) setInvestor({ vacancyMonths: 0 });
          }}
          className="flex w-full items-center justify-between text-start"
        >
          <span className="text-[15px] font-semibold text-ink">{s.investor.vacancyToggle}</span>
          <span
            aria-hidden="true"
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-pill border border-hairline text-[13px] font-bold text-inkMuted transition-transform ${
              showVacancy ? "rotate-45" : ""
            }`}
          >
            +
          </span>
        </button>
        <AnimatePresence>
          {showVacancy ? (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 20 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <p className="mb-4 text-[13px] leading-snug text-inkMuted">{s.investor.vacancyNote}</p>
              <AmountSlider
                ariaLabel={s.investor.vacancyLabel}
                value={investor.vacancyMonths}
                onChange={(vacancyMonths) => setInvestor({ vacancyMonths })}
                min={0}
                max={12}
                unit={s.investor.vacancyUnit}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Reveal>
    </QuestionShell>
  );
}
