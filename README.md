# Mashkanta Mix Simulator

See your mortgage the way the bank sees it, before you walk in.

An educational planning tool for modeling an Israeli mortgage (mashkanta) as
a portfolio of tracks (maslulim), checking it against the regulatory limits
that apply to a given borrower, and comparing it against the three official
comparison baskets every bank is required to quote.

**This is not a lender, not a licensed advisor, and does not originate
loans.** Every figure is an educational simulation, not a bank quote —
confirm with a licensed bank or advisor before committing to anything.

## Status

Phase 1 of the full spec: core calculation engine, track mix builder,
versioned regulatory rule engine, baseline vs. stress-test scenario split,
and a plain-language explanation layer on every regulatory check.

Not yet built (later phases): olim/Zakaut path, purchase tax calculator,
prepayment penalty & refinance breakeven estimators, advisor export.

## Stack

Vite + React + TypeScript + Tailwind. Fully client-side — no backend, no
database. The regulatory rule set (`src/engine/rules.ts`) and default track
rates (`src/engine/tracks.ts`) are versioned local config, not hardcoded into
calculation logic, so they can be updated independently as real-world figures
change.

## Development

```
npm install
npm run dev
```

## Calculation engine

See `src/engine/calc.ts` for the core per-track payment/interest projection
logic and the design rationale for how baseline vs. stress scenarios are
split (CPI drift is a base assumption applied in both; only the rate-shock
stress test differs between them).
