import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "he";

const LANG_KEY = "mashkanta-lang";

/** Tiny template helper: fmt("Hi {name}", { name: "X" }) */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

const en = {
  hero: {
    eyebrow: "A VryfID Company · Educational Mortgage Planning",
    h1a: "See your mortgage",
    h1b: "the way the bank sees it.",
    sub: "Build your own mashkanta mix, check it against the limits that apply to you, and compare it to the three baskets every bank is required to quote — before you walk into a branch.",
    stats: [
      ["5", "loan tracks"],
      ["3", "official baskets"],
      ["30yr", "max term"],
    ] as Array<[string, string]>,
  },
  common: {
    tabs: { profile: "Profile", mix: "Track Mix", results: "Results", comparison: "Comparison" },
    redoSetup: "Redo guided setup",
    reset: "Reset",
    profileHeading: "Your profile",
    mixHeading: "Build your track mix",
    resultsHeading: "Results",
    comparisonHeading: "Your mix vs. the official baskets",
    advancedAssumptions: "Advanced assumptions (CPI & stress test)",
    disclaimer:
      "Educational simulation, not a bank quote — confirm figures with a licensed bank or advisor before committing. Regulatory figures as of {date}.",
  },
  wizard: {
    back: "Back",
    continue: "Continue →",
    eyebrowStart: "Let's start with you",
    qCategory: "What kind of buyer are you?",
    categoryOptions: {
      first_home: { label: "First home", sub: "This will be my first place" },
      replacement_home: { label: "Replacement home", sub: "I'm selling my current home to buy this one" },
      investment: { label: "Investment / additional home", sub: "This is a second home or investment property" },
      foreign_resident: { label: "Foreign resident", sub: "I live outside Israel" },
      oleh_chadash: { label: "Oleh chadash", sub: "I'm a new immigrant" },
    },
    eyebrowAliyah: "A bit more about you",
    qAliyah: "How long ago did you make aliyah?",
    aliyahOptions: ["0–2 years ago", "3–5 years ago", "6–10 years ago", "More than 10 years ago"],
    eyebrowPrice: "The property",
    qPrice: "What's the property price?",
    priceOptions: ["Under ₪1.5M", "₪1.5M – 2M", "₪2M – 2.5M", "₪2.5M – 3.5M", "₪3.5M+"],
    eyebrowEquity: "Your equity",
    qEquity: "How much of that do you already have in cash?",
    equitySubtitle: "As a share of the {price} price you picked",
    equityOptions: ["Less than 10%", "10% – 25%", "25% – 40%", "40% or more"],
    equitySubs: ["Up to {a}", "{a} – {b}", "{a} – {b}", "{a} or more"],
    eyebrowIncome: "Your finances",
    qIncome: "What's your combined monthly net income?",
    incomeOptions: ["Under ₪10k/mo", "₪10k – 15k/mo", "₪15k – 20k/mo", "₪20k – 30k/mo", "₪30k+/mo"],
    eyebrowDebt: "Almost there",
    qDebt: "Any existing monthly debt?",
    debtSub: "Car loans, other mortgages, or standing obligations — banks count this against you.",
    debtOptions: ["None", "Under ₪1k/mo", "₪1k – 3k/mo", "₪3k – 5k/mo", "₪5k+/mo"],
    exactEyebrow: "Make it exact",
    exactHeading: "Good — now let's make it precise.",
    exactHint:
      "Ratios like payment-to-income are calculated from this exact number, so adjust it if it's off.",
    pickDifferentRange: "Pick a different range",
    eyebrowMix: "Your track mix",
    qMix: "Ready to build your mix?",
    loanLine: "Loan amount {loan} · LTV {ltv}",
    recommendedTitle: "Recommended starting mix — Basket 2",
    recommendedDesc:
      "One third fixed unindexed, one third variable CPI-indexed, one third prime — a balanced, widely-used mix.",
    paymentToday: "Payment today",
    highestExpected: "Highest expected",
    whatsInside: "What's inside",
    trackCol: "Track",
    shareCol: "Share",
    rateCol: "Rate",
    paymentCol: "Payment today",
    useMix: "Use this mix — see my results →",
    customize: "Customize manually",
    finish: "Finish setup — see my results →",
  },
  nextSteps: {
    eyebrow: "Next steps",
    title: "What happens now?",
    issuesTitle: "Fix these first",
    readyLine: "Your mix passes every regulatory check — you're ready to walk into a bank.",
    standardPath: "The standard path",
    issues: {
      ltv_fail:
        "Equity gap: at the {cap} LTV cap for your category, this price needs at least {minEquity} of equity — you're at {equity}. Close the gap with more savings, a family gift (matnat horim), or a lower-priced property.",
      pti_fail:
        "Payment too high: {pti} of net income is above the 50% legal ceiling — no bank can approve this as structured. Extend the term, add equity, or target a smaller loan.",
      pti_warn:
        "Caution zone: at {pti} of income, banks will scrutinize your file harder and may price worse. Getting under ~33% strengthens your position.",
      fixed_fail:
        "Mix not approvable: only {fixed} of the loan is in fixed-rate tracks — regulation requires at least a third. Shift allocation into a fixed track in the mix builder.",
      variable_fail:
        "Too much variable: {variable} of the mix can move with rates — the cap is two thirds. Rebalance toward fixed tracks.",
      term_warn:
        "Term capped: you asked for {requested} years but your effective cap is {effective} (payoff by age {maxAge}). Every figure here already uses {effective} years.",
      stress_gap:
        "Rate-risk exposure: your payment could climb {pct} in the stress scenario. If that jump would hurt, tilt the mix further toward fixed unindexed.",
    },
    steps: [
      {
        title: "Get your pre-approval (ishur ikaroni · אישור עקרוני)",
        body: "Apply online at 2–3 banks — Leumi, Hapoalim, Mizrahi-Tefahot, Discount. It's free, takes a few days, doesn't commit you to anything, and is typically valid for ~90 days.",
      },
      {
        title: "Make the banks compete",
        body: "Take your best quote back to the other banks — or hire a licensed mortgage advisor (yoetz mashkanta) to negotiate for you. On a loan this size, even 0.1% off a rate is worth tens of thousands of shekels.",
      },
      {
        title: "Prepare your documents",
        body: "Last 3 pay slips (tlushim) — or tax assessments if self-employed — 3 months of bank statements, teudat zehut or passport, and the draft purchase contract.",
      },
      {
        title: "Watch the clock",
        body: "Purchase tax (mas rechisha) is due within ~60 days of signing. Final approval also requires a property appraisal (shamaut) — schedule it early.",
      },
    ],
    disclaimer: "General guidance, not personal financial advice.",
  },
  badge: { pass: "Pass", warn: "Caution", fail: "Fail" },
  results: {
    healthTitle: "Mortgage health",
    healthCaption: "Based on your regulatory checks and the stress-scenario payment gap.",
    tiers: ["Bank-ready", "Solid footing", "Needs work", "Not approvable as-is"],
    paymentToday: "Payment today",
    highestExpected: "Highest expected",
    totalInterest: "Total interest",
    baselinePrefix: "Baseline: {v}",
    perMonth: "/mo",
    ltvShort: "Loan-to-Value",
    ptiShort: "Payment-to-Income",
    fixedShareLabel: "Fixed share",
    effectiveTermLabel: "Effective term",
    yrsSuffix: "yrs",
    checksTitle: "Regulatory checks",
    byTrack: "By track",
    totalInterestCol: "Total interest",
    simplifiedNote:
      "This is a simplified projection, not a bank-grade actuarial model — actual CPI and rate paths are unpredictable. Use it for planning, not as a guarantee.",
  },
  checks: {
    labels: {
      ltv: "Loan-to-Value",
      pti: "Payment-to-Income",
      fixed_share: "Minimum Fixed Share",
      variable_share: "Maximum Variable Share",
      term: "Term & Age Cap",
    },
    ltv: {
      pass: "Your loan is {value} of the property price, within the {limit} cap for your buyer category.",
      fail: "Your loan is {value} of the property price, above the {limit} cap for your buyer category. You'll need more equity or a smaller loan to bring this mix within reach.",
    },
    pti: {
      pass: "Your payment (plus existing debt) is {value} of net income, comfortably under the {caution} level banks typically look for.",
      warn: "Your payment (plus existing debt) is {value} of net income. That's legal but above the roughly {caution} mark banks self-limit around in practice — expect closer scrutiny or a less favorable rate offer.",
      fail: "Your payment (plus existing debt) is {value} of net income, above the {limit} legal ceiling — this loan is not approvable as structured.",
    },
    fixed_share: {
      pass: "{value} of your mix is fixed-rate, meeting the {limit} minimum required by regulation.",
      fail: "Only {value} of your mix is fixed-rate. At least {limit} must be fixed — move more of the loan into a fixed track to fix this.",
    },
    variable_share: {
      pass: "{value} of your mix is variable/reset-eligible, within the {limit} cap.",
      fail: "{value} of your mix is variable/reset-eligible, above the {limit} cap — move some of the loan into a fixed track to fix this.",
    },
    term: {
      pass: "Your {effective}-year term is within both the {maxTerm}-year regulatory maximum and the age-{maxAge} payoff cap.",
      warn: "You requested a {requested}-year term, but the effective cap for you is {effective} years — the smaller of the {maxTerm}-year regulatory maximum and paying off by age {maxAge}. Figures on this page use the {effective}-year effective term.",
    },
  },
  comparison: {
    mixCol: "Mix",
    yourMix: "Your mix",
    basketNames: { basket1: "Basket 1", basket2: "Basket 2", basket3: "Basket 3" },
    basketDescs: {
      basket1: "Entirely fixed, unindexed.",
      basket2:
        "One third fixed unindexed, one third variable CPI-indexed (5yr reset), one third prime.",
      basket3: "One half fixed unindexed, one half prime.",
    },
  },
  mixBuilder: {
    allocated: "Allocated",
    shouldTotal: "should total 100%",
    fixed: "Fixed",
    variable: "Variable",
    allocation: "Allocation",
    rate: "Rate",
  },
  export: {
    title: "Take it with you",
    sub: "Everything on this page, formatted for a bank meeting or a mortgage advisor.",
    printBtn: "Download PDF summary",
    copyBtn: "Copy summary as text",
    copied: "Copied — paste it anywhere",
    banksTitle: "Apply for pre-approval (ishur ikaroni)",
    banksNote:
      "Banks don't allow their sites to be embedded, so these open in a new tab. Your numbers travel with you — download or copy the summary first.",
    call: "Call",
    visit: "Bank site",
  },
  printDoc: {
    title: "Mashkanta Mix — Summary",
    generated: "Generated {date} · Mashkanta Mix Simulator — a VryfID company",
    profileTitle: "Borrower profile",
    mixTitle: "Requested mix",
    resultsTitle: "Projections",
    assumptionsLine: "Assumptions: CPI {cpi}/yr · stress shock +{shock}pp",
  },
  computing: [
    "Running your mix…",
    "Checking Bank of Israel limits…",
    "Benchmarking the three baskets…",
  ],
  assumptions: {
    cpiLabel: "Expected annual CPI",
    cpiUnit: "%/yr",
    shockLabel: "Stress test rate shock",
    shockUnit: "pp",
    para1:
      "The CPI assumption compounds into every CPI-indexed track's projected payment and total interest. The stress shock is added to every variable/reset-eligible track's rate (prime immediately, 5-year reset tracks from their reset point forward) to compute the \"highest expected payment\" scenario.",
    para2:
      "Live Bank of Israel policy rate integration is planned for a later phase — for now, set these manually based on your own expectations.",
  },
};

export type Strings = typeof en;

const he: Strings = {
  hero: {
    eyebrow: "חברת VryfID · תכנון משכנתא לימודי",
    h1a: "לראות את המשכנתא",
    h1b: "כמו שהבנק רואה אותה.",
    sub: "בנו תמהיל משכנתא משלכם, בדקו אותו מול המגבלות שחלות עליכם, והשוו אותו לשלושת הסלים שכל בנק מחויב להציע — עוד לפני שנכנסתם לסניף.",
    stats: [
      ["5", "מסלולי הלוואה"],
      ["3", "סלים רשמיים"],
      ["30", "שנים לכל היותר"],
    ],
  },
  common: {
    tabs: { profile: "פרופיל", mix: "תמהיל", results: "תוצאות", comparison: "השוואה" },
    redoSetup: "הגדרה מודרכת מחדש",
    reset: "איפוס",
    profileHeading: "הפרופיל שלכם",
    mixHeading: "הרכיבו את תמהיל המסלולים",
    resultsHeading: "תוצאות",
    comparisonHeading: "התמהיל שלכם מול הסלים הרשמיים",
    advancedAssumptions: "הנחות מתקדמות (מדד ותרחיש קיצון)",
    disclaimer:
      "סימולציה לימודית בלבד, לא הצעת מחיר מבנק — אמתו את המספרים מול בנק או יועץ מורשה לפני כל התחייבות. נתוני הרגולציה נכונים ל־{date}.",
  },
  wizard: {
    back: "חזרה",
    continue: "המשך ←",
    eyebrowStart: "נתחיל בכם",
    qCategory: "איזה סוג רוכשים אתם?",
    categoryOptions: {
      first_home: { label: "דירה ראשונה", sub: "זו תהיה הדירה הראשונה שלי" },
      replacement_home: { label: "דירה חלופית", sub: "מוכרים את הדירה הנוכחית וקונים חדשה" },
      investment: { label: "השקעה / דירה נוספת", sub: "דירה שנייה או נכס להשקעה" },
      foreign_resident: { label: "תושב חוץ", sub: "אני גר מחוץ לישראל" },
      oleh_chadash: { label: "עולה חדש", sub: "עליתי לישראל" },
    },
    eyebrowAliyah: "עוד קצת עליכם",
    qAliyah: "לפני כמה זמן עליתם לישראל?",
    aliyahOptions: ["לפני 0–2 שנים", "לפני 3–5 שנים", "לפני 6–10 שנים", "לפני יותר מ־10 שנים"],
    eyebrowPrice: "הנכס",
    qPrice: "מה מחיר הנכס?",
    priceOptions: [
      "עד 1.5 מיליון ₪",
      "1.5–2 מיליון ₪",
      "2–2.5 מיליון ₪",
      "2.5–3.5 מיליון ₪",
      "מעל 3.5 מיליון ₪",
    ],
    eyebrowEquity: "ההון העצמי שלכם",
    qEquity: "כמה הון עצמי כבר יש לכם?",
    equitySubtitle: "מתוך מחיר הנכס של {price}",
    equityOptions: ["פחות מ־10%", "10%–25%", "25%–40%", "40% ומעלה"],
    equitySubs: ["עד {a}", "{a} – {b}", "{a} – {b}", "{a} ומעלה"],
    eyebrowIncome: "הכספים שלכם",
    qIncome: "מה ההכנסה החודשית נטו של משק הבית?",
    incomeOptions: [
      "עד 10,000 ₪ בחודש",
      "10–15 אלף ₪ בחודש",
      "15–20 אלף ₪ בחודש",
      "20–30 אלף ₪ בחודש",
      "מעל 30 אלף ₪ בחודש",
    ],
    eyebrowDebt: "כמעט סיימנו",
    qDebt: "יש החזרי חוב חודשיים קיימים?",
    debtSub: "הלוואות רכב, משכנתאות נוספות והתחייבויות קבועות — הבנק סופר את זה נגדכם.",
    debtOptions: ["אין", "עד 1,000 ₪ בחודש", "1–3 אלף ₪ בחודש", "3–5 אלף ₪ בחודש", "מעל 5,000 ₪ בחודש"],
    exactEyebrow: "דיוק אחרון",
    exactHeading: "מעולה — עכשיו נדייק את המספר.",
    exactHint: "יחסים כמו החזר-מהכנסה מחושבים מהמספר המדויק הזה, אז כדאי לעדכן אותו אם הוא לא מדויק.",
    pickDifferentRange: "בחרו טווח אחר",
    eyebrowMix: "תמהיל המסלולים שלכם",
    qMix: "מוכנים להרכיב את התמהיל?",
    loanLine: "סכום הלוואה {loan} · אחוז מימון {ltv}",
    recommendedTitle: "תמהיל פתיחה מומלץ — סל 2",
    recommendedDesc:
      "שליש בריבית קבועה לא צמודה, שליש משתנה צמודת מדד, שליש פריים — תמהיל מאוזן ונפוץ.",
    paymentToday: "החזר היום",
    highestExpected: "החזר צפוי מקסימלי",
    whatsInside: "מה יש בפנים",
    trackCol: "מסלול",
    shareCol: "נתח",
    rateCol: "ריבית",
    paymentCol: "החזר היום",
    useMix: "קחו את התמהיל הזה — לתוצאות",
    customize: "התאמה ידנית",
    finish: "סיום ההגדרה — לתוצאות",
  },
  nextSteps: {
    eyebrow: "הצעדים הבאים",
    title: "אז מה עושים עכשיו?",
    issuesTitle: "קודם מטפלים באלה",
    readyLine: "התמהיל שלכם עובר את כל בדיקות הרגולציה — אתם מוכנים להיכנס לבנק.",
    standardPath: "המסלול הרגיל",
    issues: {
      ltv_fail:
        "פער הון עצמי: בתקרת מימון של {cap} לקטגוריה שלכם, המחיר הזה דורש לפחות {minEquity} הון עצמי — יש לכם {equity}. סגרו את הפער עם חיסכון נוסף, מתנת הורים, או נכס במחיר נמוך יותר.",
      pti_fail:
        "החזר גבוה מדי: {pti} מההכנסה נטו — מעל התקרה החוקית של 50%, ואף בנק לא יאשר את המבנה הזה. האריכו את התקופה, הוסיפו הון עצמי, או כוונו להלוואה קטנה יותר.",
      pti_warn:
        "אזור זהירות: ב־{pti} מההכנסה הבנקים יבדקו את התיק שלכם לעומק ועלולים לתמחר גבוה יותר. ירידה מתחת ל~33% מחזקת את העמדה שלכם.",
      fixed_fail:
        "התמהיל לא יאושר: רק {fixed} מההלוואה במסלולים בריבית קבועה — הרגולציה דורשת לפחות שליש. העבירו הקצאה למסלול קבוע בבונה התמהיל.",
      variable_fail:
        "יותר מדי משתנה: {variable} מהתמהיל יכול לזוז עם הריבית — התקרה היא שני שליש. אזנו מחדש לכיוון מסלולים קבועים.",
      term_warn:
        "התקופה קוצצה: ביקשתם {requested} שנים אך התקרה האפקטיבית שלכם היא {effective} (פירעון עד גיל {maxAge}). כל המספרים כאן כבר מחושבים לפי {effective} שנים.",
      stress_gap:
        "חשיפה לסיכון ריבית: ההחזר עלול לטפס {pct} בתרחיש הקיצון. אם קפיצה כזו תכאב, הטו את התמהיל עוד לכיוון קבועה לא צמודה.",
    },
    steps: [
      {
        title: "השיגו אישור עקרוני",
        body: "הגישו בקשה לאישור עקרוני אונליין ב־2–3 בנקים — לאומי, הפועלים, מזרחי-טפחות, דיסקונט. זה חינם, לוקח כמה ימים, לא מחייב אתכם, ותקף בדרך כלל כ־90 יום.",
      },
      {
        title: "תנו לבנקים להתחרות",
        body: "קחו את ההצעה הטובה ביותר לבנקים האחרים — או שכרו יועץ משכנתאות מורשה שינהל את המשא ומתן בשבילכם. בהלוואה בגודל כזה, גם 0.1% פחות בריבית שווה עשרות אלפי שקלים.",
      },
      {
        title: "הכינו מסמכים",
        body: "3 תלושי שכר אחרונים (או שומות מס לעצמאים), 3 חודשי דפי חשבון בנק, תעודת זהות או דרכון, וטיוטת חוזה הרכישה.",
      },
      {
        title: "שימו לב ללוח הזמנים",
        body: "מס רכישה משולם תוך כ־60 יום מהחתימה. האישור הסופי דורש גם שמאות לנכס — קבעו אותה מוקדם.",
      },
    ],
    disclaimer: "הכוונה כללית, לא ייעוץ פיננסי אישי.",
  },
  badge: { pass: "עובר", warn: "זהירות", fail: "נכשל" },
  results: {
    healthTitle: "בריאות המשכנתא",
    healthCaption: "מבוסס על בדיקות הרגולציה שלכם ופער ההחזר בתרחיש הקיצון.",
    tiers: ["מוכנים לבנק", "בסיס יציב", "דורש עבודה", "לא יאושר במתכונת הזו"],
    paymentToday: "החזר היום",
    highestExpected: "החזר צפוי מקסימלי",
    totalInterest: "סך ריבית",
    baselinePrefix: "תרחיש בסיס: {v}",
    perMonth: "/חודש",
    ltvShort: "יחס מימון",
    ptiShort: "החזר מהכנסה",
    fixedShareLabel: "רכיב קבוע",
    effectiveTermLabel: "תקופה אפקטיבית",
    yrsSuffix: "שנים",
    checksTitle: "בדיקות רגולציה",
    byTrack: "לפי מסלול",
    totalInterestCol: "סך ריבית",
    simplifiedNote:
      "זו הערכה מפושטת, לא מודל אקטוארי בנקאי — מסלולי מדד וריבית אמיתיים אינם ניתנים לחיזוי. השתמשו בזה לתכנון, לא כהתחייבות.",
  },
  checks: {
    labels: {
      ltv: "יחס מימון (LTV)",
      pti: "יחס החזר מהכנסה",
      fixed_share: "רכיב קבוע מינימלי",
      variable_share: "רכיב משתנה מקסימלי",
      term: "תקרת תקופה וגיל",
    },
    ltv: {
      pass: "ההלוואה שלכם היא {value} ממחיר הנכס — בתוך תקרת {limit} לקטגוריית הרוכש שלכם.",
      fail: "ההלוואה שלכם היא {value} ממחיר הנכס — מעל תקרת {limit} לקטגוריה שלכם. תצטרכו יותר הון עצמי או הלוואה קטנה יותר כדי שהתמהיל יעבוד.",
    },
    pti: {
      pass: "ההחזר (כולל חוב קיים) הוא {value} מההכנסה נטו — בנוח מתחת לרף {caution} שהבנקים מחפשים.",
      warn: "ההחזר (כולל חוב קיים) הוא {value} מההכנסה נטו. זה חוקי, אבל מעל רף ~{caution} שהבנקים מגבילים בפועל — צפו לבדיקה קפדנית יותר או ריבית פחות טובה.",
      fail: "ההחזר (כולל חוב קיים) הוא {value} מההכנסה נטו — מעל התקרה החוקית של {limit}. ההלוואה במבנה הזה לא תאושר.",
    },
    fixed_share: {
      pass: "{value} מהתמהיל בריבית קבועה — עומד במינימום {limit} שדורשת הרגולציה.",
      fail: "רק {value} מהתמהיל בריבית קבועה. לפחות {limit} חייב להיות קבוע — העבירו עוד מההלוואה למסלול קבוע.",
    },
    variable_share: {
      pass: "{value} מהתמהיל משתנה/עם תחנות — בתוך תקרת {limit}.",
      fail: "{value} מהתמהיל משתנה/עם תחנות — מעל תקרת {limit}. העבירו חלק מההלוואה למסלול קבוע.",
    },
    term: {
      pass: "תקופה של {effective} שנים — בתוך המקסימום הרגולטורי של {maxTerm} שנה ותקרת פירעון עד גיל {maxAge}.",
      warn: "ביקשתם תקופה של {requested} שנים, אבל התקרה האפקטיבית שלכם היא {effective} שנים — הנמוך מבין {maxTerm} שנה לפי רגולציה ופירעון עד גיל {maxAge}. המספרים בעמוד מחושבים לפי {effective} שנים.",
    },
  },
  comparison: {
    mixCol: "תמהיל",
    yourMix: "התמהיל שלכם",
    basketNames: { basket1: "סל 1", basket2: "סל 2", basket3: "סל 3" },
    basketDescs: {
      basket1: "כולו בריבית קבועה לא צמודה.",
      basket2: "שליש קבועה לא צמודה, שליש משתנה צמודת מדד (תחנה כל 5 שנים), שליש פריים.",
      basket3: "מחצית קבועה לא צמודה, מחצית פריים.",
    },
  },
  mixBuilder: {
    allocated: "הוקצה",
    shouldTotal: "צריך להסתכם ב־100%",
    fixed: "קבועה",
    variable: "משתנה",
    allocation: "הקצאה",
    rate: "ריבית",
  },
  export: {
    title: "קחו את זה איתכם",
    sub: "כל מה שבעמוד הזה, מסודר לפגישה בבנק או ליועץ משכנתאות.",
    printBtn: "הורידו סיכום PDF",
    copyBtn: "העתיקו סיכום כטקסט",
    copied: "הועתק — הדביקו בכל מקום",
    banksTitle: "הגישו בקשה לאישור עקרוני",
    banksNote:
      "הבנקים לא מאפשרים להטמיע את האתרים שלהם, אז הקישורים נפתחים בלשונית חדשה. המספרים שלכם הולכים איתכם — הורידו או העתיקו את הסיכום קודם.",
    call: "חייגו",
    visit: "לאתר הבנק",
  },
  printDoc: {
    title: "סיכום תמהיל משכנתא",
    generated: "הופק {date} · סימולטור תמהיל משכנתא — חברת VryfID",
    profileTitle: "פרופיל הלווה",
    mixTitle: "התמהיל המבוקש",
    resultsTitle: "תחזיות",
    assumptionsLine: "הנחות: מדד {cpi} בשנה · תרחיש קיצון ‎+{shock} נק׳",
  },
  computing: ["מריצים את התמהיל שלכם…", "בודקים את מגבלות בנק ישראל…", "משווים לשלושת הסלים…"],
  assumptions: {
    cpiLabel: "מדד שנתי צפוי",
    cpiUnit: "% בשנה",
    shockLabel: "תרחיש קיצון — עליית ריבית",
    shockUnit: "נק׳",
    para1:
      "הנחת המדד נצברת לתוך ההחזר הצפוי וסך הריבית של כל מסלול צמוד. תרחיש הקיצון מתווסף לריבית של כל מסלול משתנה (פריים מיידית, מסלולי תחנה מנקודת העדכון והלאה) לחישוב ההחזר הצפוי המקסימלי.",
    para2:
      "חיבור לריבית בנק ישראל בזמן אמת מתוכנן לשלב הבא — בינתיים קבעו את ההנחות לפי הציפיות שלכם.",
  },
};

export const STRINGS: Record<Lang, Strings> = { en, he };

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Strings;
}

const LangContext = createContext<LangContextValue>({ lang: "en", setLang: () => {}, t: en });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      return stored === "he" ? "he" : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // localStorage unavailable (private mode) — language just won't persist
    }
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang, t: STRINGS[lang] }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
