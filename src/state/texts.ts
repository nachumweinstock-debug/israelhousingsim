import type { Lang } from "../i18n";
import type { TrackKey } from "../lib/mortgageMath";

/**
 * Full bilingual catalog for the simulator flow. English uses plain
 * English names for the tracks (no transliterations like Kalatz or Katz,
 * which mean nothing to an American reader); Hebrew uses the real terms.
 * Templates use {name} placeholders resolved with fmt() from ../i18n.
 */
export interface SimStrings {
  welcome: {
    titleWords: string[];
    sub: string;
    start: string;
    caption: string;
  };
  residency: {
    title: string;
    helper: string;
    israeli: { title: string; sub: string };
    oleh: { title: string; sub: string };
    foreign: { title: string; sub: string };
  };
  aliyah: {
    title: string;
    helper: string;
    yearsQuestion: string;
    yearUnit: string;
    yearsUnit: string;
    lateWindowNote: string;
    ownedQuestion: string;
    ownedNote: string;
    yes: string;
    no: string;
    infoNote: string;
  };
  identity: {
    title: string;
    helper: string;
    nameLabel: string;
    namePlaceholder: string;
    idLabel: string;
    idPlaceholder: string;
    idInvalid: string;
    verifyButton: string;
    verifying: string;
    verifiedLabel: string;
    editLink: string;
    methodNote: string;
  };
  buyerStatus: {
    title: string;
    helper: string;
    firstHome: { title: string; sub: string };
    replacingHome: { title: string; sub: string };
    investment: { title: string; sub: string };
    olehNote: string;
    foreignNote: string;
    firstHomeNote: string;
    replacingNote: string;
    investmentNote: string;
  };
  existingHome: {
    title: string;
    helper: string;
    sold: { title: string; sub: string };
    underContract: { title: string; sub: string };
    notListed: { title: string; sub: string };
    bridgeNote: string;
  };
  incomeDebt: {
    title: string;
    helper: string;
    incomeLabel: string;
    coApplicantToggle: string;
    coApplicantIncomeLabel: string;
    employmentLabel: string;
    salaried: string;
    selfEmployed: string;
    mixed: string;
    employmentNoteSelfEmployed: string;
    tenureLabel: string;
    tenureNoteShort: string;
    debtLabel: string;
    debtNote: string;
  };
  price: { title: string; helper: string; aria: string };
  down: {
    title: string;
    helper: string;
    modeShekels: string;
    modePercent: string;
    pctOfPrice: string;
    amountIs: string;
    loanAmount: string;
    ltv: string;
    warning: string;
  };
  downPaymentSource: {
    title: string;
    helper: string;
    savings: { title: string; sub: string };
    homeSale: { title: string; sub: string };
    gift: { title: string; sub: string };
    other: { title: string; sub: string };
    giftNote: string;
    homeSaleQuestion: string;
    inHand: string;
    pending: string;
    pendingNote: string;
  };
  term: { title: string; helper: string; yearsUnit: string };
  mix: {
    title: string;
    helper: string;
    presets: { balanced: string; stability: string; lowest: string };
    primeCapWarning: string;
    fixedFloorWarning: string;
    paymentPreview: string;
    inflationNote: string;
    dtiPreviewLabel: string;
    dtiWarning: string;
  };
  tracks: Record<TrackKey, { name: string; tagline: string }>;
  inflation: {
    title: string;
    helper: string;
    low: { title: string; sub: string };
    medium: { title: string; sub: string };
    high: { title: string; sub: string };
    linkedNote: string;
    noneNote: string;
  };
  costs: {
    title: string;
    helper: string;
    purchaseTaxLabel: string;
    purchaseTaxNoteOleh: string;
    purchaseTaxNote: string;
    resetToEstimate: string;
    legalLabel: string;
    legalNote: string;
    agentLabel: string;
    agentNote: string;
    otherLabel: string;
    otherNote: string;
    vatIncl: string;
    costsTotal: string;
    cashTotal: string;
    continueLabel: string;
  };
  creditStanding: {
    title: string;
    helper: string;
    missedPaymentsQuestion: string;
    collectionsQuestion: string;
    bankruptcyQuestion: string;
    yes: string;
    no: string;
    disclosureNote: string;
  };
  report: {
    confirmsTitle: string;
    stillNeedsTitle: string;
    identityLine: string;
    dtiConfirmLine: string;
    dtiWarningFriction: string;
    dtiWarningHard: string;
    downPaymentSourceConfirmLine: string;
    variableWithinLimitLine: string;
    variableOverLimitWarning: string;
    consistencyConfirmLine: string;
    paymentTodayLabel: string;
    paymentYearLabel: string;
    paymentGrowNote: string;
    rateNoteUnderTable: string;
    bridgeCaution: string;
    stillNeeds: {
      identityPending: string;
      credit: string;
      incomeDocsSalaried: string;
      incomeDocsSelfEmployed: string;
      incomeDocsMixed: string;
      appraisal: string;
      finalRate: string;
    };
  };
  summary: {
    crunch: string[];
    title: string;
    heroSub: string;
    totalInterest: string;
    totalRepayment: string;
    ltv: string;
    ltvSub: string;
    cashToClose: string;
    cashSub: string;
    mixTitle: string;
    perMonth: string;
    stressTitle: string;
    stressUp1: string;
    stressUp2: string;
    disclaimer: string;
    startOver: string;
  };
  exportPanel: {
    title: string;
    sub: string;
    downloadHe: string;
    downloadEn: string;
    downloadBoth: string;
    banksTitle: string;
    banksNote: string;
    call: string;
    visit: string;
  };
  nextSteps: {
    title: string;
    steps: Array<{ title: string; body: string }>;
  };
  print: {
    title: string;
    subtitle: string;
    generated: string;
    inputsTitle: string;
    labels: {
      residency: string;
      buyerStatus: string;
      existingHomeStatus: string;
      propertyPrice: string;
      downPayment: string;
      downPaymentSource: string;
      loanAmount: string;
      term: string;
      inflation: string;
      income: string;
      employment: string;
      tenure: string;
      debt: string;
      dti: string;
    };
    residencyValues: { israeli: string; oleh: string; foreign: string };
    buyerValues: { firstHome: string; replacingHome: string; investment: string };
    inflationValues: { low: string; medium: string; high: string };
    mixTitle: string;
    trackCols: string[];
    resultsTitle: string;
    labelsResults: {
      monthlyPayment: string;
      paymentYear: string;
      totalInterest: string;
      totalRepayment: string;
      stress1: string;
      stress2: string;
    };
    costsTitle: string;
    labelsCosts: {
      purchaseTax: string;
      legal: string;
      agent: string;
      other: string;
      costsTotal: string;
      cashToClose: string;
    };
    yearsUnit: string;
    footer: string;
  };
  common: { continueLabel: string; backAria: string; yes: string; no: string };
}

const en: SimStrings = {
  welcome: {
    titleWords: ["Let's", "figure", "out", "your", "mortgage."],
    sub: "A few quick questions to a realistic picture of your Israeli mortgage, the monthly payment, the loan mix behind it, and the real cash you'll need to close. About two minutes.",
    start: "Start",
    caption: "No signup · Estimate only",
  },
  residency: {
    title: "Where do you stand with Israeli residency?",
    helper:
      "This one matters a lot, how much banks can lend you and which benefits you can claim differ sharply by answer.",
    israeli: { title: "Israeli resident", sub: "Living in Israel with citizenship or residency" },
    oleh: { title: "New immigrant (oleh chadash)", sub: "Extra benefits may apply" },
    foreign: { title: "Foreign resident", sub: "Buying from abroad, stricter lending caps" },
  },
  aliyah: {
    title: "Tell us about your aliyah.",
    helper:
      "Subsidized immigrant benefits generally run for roughly the first 10 to 15 years after aliyah, depending on the program.",
    yearsQuestion: "How many years since your aliyah?",
    yearUnit: "year",
    yearsUnit: "years",
    lateWindowNote:
      "At {years} years in, some benefit windows may be closing, worth confirming which programs still apply to you.",
    ownedQuestion: "Have you owned property in Israel before?",
    ownedNote:
      "Owning property in the past 10 years affects eligibility for the government backed Zakaut loan.",
    yes: "Yes",
    no: "No",
    infoNote:
      "New immigrants can generally borrow up to 75% of the property value versus 50% for foreign residents, may be eligible for a small government backed loan at a reduced fixed rate, and often pay reduced purchase tax. This simulator gives an estimate only, a licensed mortgage advisor should confirm actual eligibility and terms.",
  },
  identity: {
    title: "Let's verify who you are.",
    helper:
      "A report tied to a verified identity carries more weight with a bank than an anonymous number. This takes a few seconds.",
    nameLabel: "Full legal name",
    namePlaceholder: "As it appears on your teudat zehut",
    idLabel: "Teudat zehut number",
    idPlaceholder: "9 digits",
    idInvalid: "That doesn't look like a valid teudat zehut number, check the digits.",
    verifyButton: "Verify identity",
    verifying: "Verifying…",
    verifiedLabel: "Identity verified via VryfID on {date}",
    editLink: "Edit and reverify",
    methodNote:
      "This checks that the number is well formed using the standard teudat zehut check digit, it does not look up a government registry.",
  },
  buyerStatus: {
    title: "What are you buying?",
    helper: "This sets how much of the price a bank is allowed to finance.",
    firstHome: { title: "First home in Israel", sub: "Your first property here" },
    replacingHome: { title: "Replacing an existing home", sub: "Selling one place, buying another" },
    investment: { title: "Investment property", sub: "You already own where you live" },
    olehNote: "As a new immigrant, banks can generally lend you up to {ceiling} of the property value.",
    foreignNote: "As a foreign resident, banks generally cap lending around {ceiling} of the property value.",
    firstHomeNote: "For a first home, banks can lend up to about {ceiling}, plan for at least 25% down.",
    replacingNote: "When replacing a home, banks can lend up to about {ceiling} of the new property's value.",
    investmentNote:
      "For an investment property, lending is capped around {ceiling}, half the price comes from you.",
  },
  existingHome: {
    title: "What's the status of your current home?",
    helper:
      "This changes both your real available loan to value and your purchase tax bracket, so it matters even before the sale is final.",
    sold: { title: "Already sold", sub: "The sale has closed" },
    underContract: { title: "Under contract", sub: "Signed, waiting to close" },
    notListed: { title: "Not sold or listed yet", sub: "Still deciding on timing" },
    bridgeNote:
      "Since the sale hasn't closed, a bridge structure may apply. The loan to value and purchase tax figures here assume the sale completes within the standard window for the reduced rate, otherwise the higher additional dwelling tax bracket applies temporarily.",
  },
  incomeDebt: {
    title: "Income and existing debt.",
    helper:
      "Bank of Israel caps the total payment at 50% of net household income, and banks generally want it comfortably under 40% to move without friction. This is the real gate, more than the property price.",
    incomeLabel: "Net monthly household income (primary applicant)",
    coApplicantToggle: "Is there a coapplicant?",
    coApplicantIncomeLabel: "Coapplicant's net monthly income",
    employmentLabel: "Employment type",
    salaried: "Salaried",
    selfEmployed: "Self employed",
    mixed: "A mix of both",
    employmentNoteSelfEmployed:
      "Self employed applicants generally need tax filings and an accountant's letter, banks price that risk a little differently.",
    tenureLabel: "Years at your current employer or in business",
    tenureNoteShort:
      "Under a year or two at a job can work against you with some banks, they may ask for more history.",
    debtLabel: "Existing monthly debt obligations",
    debtNote: "Car loans, other loans, credit lines, alimony, anything with a fixed monthly payment.",
  },
  price: {
    title: "What's the property price?",
    helper: "A rough number is fine, you can come back and adjust it any time.",
    aria: "Property price in shekels",
  },
  down: {
    title: "How much can you put down?",
    helper: "Set it in shekels or as a percent of the price, both stay in sync.",
    modeShekels: "₪ amount",
    modePercent: "% of price",
    pctOfPrice: "That's {pct}% of the price.",
    amountIs: "That's {amount}.",
    loanAmount: "Loan amount",
    ltv: "Loan to value",
    warning:
      "That's above the roughly {ceiling} banks can lend for your situation, you'd likely need a bigger down payment or a cheaper property.",
  },
  downPaymentSource: {
    title: "Where is the down payment coming from?",
    helper: "Banks want documentation here, not just a number.",
    savings: { title: "Savings", sub: "Funds already set aside" },
    homeSale: { title: "Sale of current home", sub: "Proceeds from selling your place" },
    gift: { title: "Gift from family", sub: "A relative is contributing" },
    other: { title: "Other", sub: "Something else entirely" },
    giftNote: "Banks will ask for a gift letter confirming the funds aren't a loan in disguise.",
    homeSaleQuestion: "Are those funds already in hand, or still pending the sale?",
    inHand: "Already in hand",
    pending: "Still pending",
    pendingNote:
      "Until the sale closes, a bank will usually want a bridge plan or proof of the pending proceeds.",
  },
  term: {
    title: "Over how many years?",
    helper:
      "25 years is the most common choice in Israel. Longer means lower monthly payments but more interest overall.",
    yearsUnit: "years",
  },
  mix: {
    title: "Build your loan mix.",
    helper:
      "Israeli mortgages are split across tracks, each with its own rate behavior. Most people blend all three, start from a preset and drag to taste.",
    presets: { balanced: "Balanced", stability: "Rate stability", lowest: "Lowest payment" },
    primeCapWarning:
      "Bank of Israel rules cap the Prime track at two thirds of the mix, more than 66% here won't hold up in underwriting.",
    fixedFloorWarning:
      "At least a third of the mix has to sit in a fixed rate track, nudge one of them up.",
    paymentPreview: "Estimated monthly payment with this mix",
    inflationNote:
      "Assumes inflation of about 2.5% a year (the Bank of Israel target) on the inflation linked track.",
    dtiPreviewLabel: "Payment to income with this mix",
    dtiWarning:
      "That's above the 40% comfort line banks typically use, 50% is the legal ceiling.",
  },
  tracks: {
    prime: { name: "Prime (variable)", tagline: "Follows the Bank of Israel rate, can move any month" },
    kalatz: { name: "Fixed rate", tagline: "Same payment every month, not linked to inflation" },
    katz: { name: "Fixed, inflation linked", tagline: "Low fixed rate, but the balance tracks the CPI" },
  },
  inflation: {
    title: "How will inflation behave?",
    helper:
      "Nobody knows, that's the point. This only moves the inflation linked part of your mix, and it's the long run cost a plain calculator hides.",
    low: { title: "Low, around 1% a year", sub: "The price index stays quiet" },
    medium: { title: "Medium, around 2.5% a year", sub: "Near the Bank of Israel's target range" },
    high: { title: "High, around 4% a year", sub: "Prices run hot for years" },
    linkedNote:
      "{share}% of your mix is inflation linked, so this scenario compounds at {rate} a year against that portion.",
    noneNote: "Your mix has no inflation linked track right now, so this choice barely moves your numbers.",
  },
  costs: {
    title: "The real cost to close.",
    helper:
      "Beyond the down payment, plan for these. Defaults are typical for Israeli deals, edit anything to match yours.",
    purchaseTaxLabel: "Purchase tax (mas rechisha)",
    purchaseTaxNoteOleh: "Estimate includes the possible new immigrant reduction, verify your eligibility.",
    purchaseTaxNote: "Estimated from simplified brackets, the exact figure depends on the deal.",
    resetToEstimate: "Reset to estimate ({amount})",
    legalLabel: "Legal fees",
    legalNote: "Plus VAT, typical range is 0.5% to 1.5% of the price.",
    agentLabel: "Agent commission",
    agentNote: "Plus VAT, set 0 if there's no agent.",
    otherLabel: "Appraiser & registration",
    otherNote: "Appraisal, registration, and mortgage file fees.",
    vatIncl: "≈ {amount} incl. VAT",
    costsTotal: "Costs beyond the loan",
    cashTotal: "Total cash to close (with down payment)",
    continueLabel: "See my report",
  },
  creditStanding: {
    title: "Your credit standing, as you understand it.",
    helper:
      "A real credit report requires bank or licensed access, this simulator can't check it. Answer honestly, your bank will pull an independent report regardless.",
    missedPaymentsQuestion: "Any missed payments in the last two years?",
    collectionsQuestion: "Any active collections?",
    bankruptcyQuestion: "Any bankruptcy history?",
    yes: "Yes",
    no: "No",
    disclosureNote:
      "These answers aren't scored or verified here. Your bank will pull an independent credit report regardless of what you enter.",
  },
  report: {
    confirmsTitle: "What this confirms",
    stillNeedsTitle: "What the bank will still need",
    identityLine: "Identity verified via VryfID on {date}.",
    dtiConfirmLine: "Income and payment to income ratio calculated: {dti}.",
    dtiWarningFriction:
      "Payment to income is {dti}, above the 40% comfort line banks typically use. Expect closer scrutiny or a smaller loan.",
    dtiWarningHard:
      "Payment to income is {dti}, above the Bank of Israel's 50% legal ceiling. This needs a smaller loan, more income, or less existing debt before it holds up.",
    downPaymentSourceConfirmLine: "Down payment source documented ({source}).",
    variableWithinLimitLine: "Loan mix within Bank of Israel's variable rate exposure limit.",
    variableOverLimitWarning:
      "This mix exceeds the two thirds Prime cap. Adjust it before treating this report as bank ready.",
    consistencyConfirmLine: "Figures are internally consistent across price, mix, and costs.",
    paymentTodayLabel: "Payment today (month one)",
    paymentYearLabel: "Estimated payment in year {year}",
    paymentGrowNote:
      "The inflation linked share of your mix grows with the CPI, so the month one payment isn't the number to quote for the life of the loan.",
    rateNoteUnderTable: "Rates shown are illustrative and move weekly, confirm current rates with the bank.",
    bridgeCaution:
      "The current home hasn't sold yet, so the loan to value and purchase tax figures here assume the sale completes on schedule. Otherwise a bridge structure and the higher additional dwelling tax bracket apply temporarily.",
    stillNeeds: {
      identityPending: "Identity verification, not completed in this session.",
      credit: "An independent credit bureau report, self declared answers here don't replace it.",
      incomeDocsSalaried: "Recent payslips confirming the income entered.",
      incomeDocsSelfEmployed: "Tax filings and an accountant's letter confirming income.",
      incomeDocsMixed: "Payslips plus tax filings covering both income sources.",
      appraisal: "A property appraisal.",
      finalRate: "A final rate quote from the specific bank, the rates here are illustrative.",
    },
  },
  summary: {
    crunch: ["Blending your loan mix…", "Projecting inflation…", "Stress testing the Prime rate…"],
    title: "Your mortgage readiness report.",
    heroSub: "Blended across your loan mix over {years} years",
    totalInterest: "Total interest",
    totalRepayment: "Total repayment",
    ltv: "Loan to value",
    ltvSub: "On a {price} property",
    cashToClose: "Cash to close",
    cashSub: "Down payment plus taxes and fees",
    mixTitle: "Your mix",
    perMonth: "/mo",
    stressTitle: "If the Prime rate rises",
    stressUp1: "Prime up 1 point:",
    stressUp2: "Prime up 2 points:",
    disclaimer:
      "This is an estimate for planning purposes, not a binding offer. Rates, tax brackets, and eligibility rules change, a licensed mortgage advisor should confirm real terms with a bank.",
    startOver: "Start over",
  },
  exportPanel: {
    title: "Take this report with you",
    sub: "Download a branded PDF summary to bring to a bank or advisor.",
    downloadHe: "Download PDF · עברית",
    downloadEn: "Download PDF · English",
    downloadBoth: "Download both",
    banksTitle: "Where to take it next",
    banksNote: "Open a bank's mortgage page to start an ishur ikroni. Plain links, no affiliation.",
    call: "Call",
    visit: "Visit",
  },
  nextSteps: {
    title: "Your next steps",
    steps: [
      {
        title: "Get an ishur ikroni",
        body: "Ask 2 or 3 banks for an ishur ikroni, an initial in principle confirmation, based on these numbers. It's free and doesn't commit you.",
      },
      {
        title: "Compare mixes, not just rates",
        body: "Banks will each quote their own mix. Use this report as your baseline so you can compare like for like.",
      },
      {
        title: "Talk to a licensed advisor",
        body: "A mortgage advisor (yoetz mashkantaot) can negotiate rates and confirm benefits you may be entitled to.",
      },
    ],
  },
  print: {
    title: "VryfID Mortgage Readiness Report",
    subtitle: "Estimated figures based on the inputs provided, subject to bank underwriting",
    generated: "Generated {date} by VryfID",
    inputsTitle: "Your inputs",
    labels: {
      residency: "Residency",
      buyerStatus: "Buying",
      existingHomeStatus: "Current home status",
      propertyPrice: "Property price",
      downPayment: "Down payment",
      downPaymentSource: "Down payment source",
      loanAmount: "Loan amount",
      term: "Term",
      inflation: "Inflation scenario",
      income: "Net monthly household income",
      employment: "Employment type",
      tenure: "Years at employer or in business",
      debt: "Existing monthly debt",
      dti: "Payment to income",
    },
    residencyValues: {
      israeli: "Israeli resident",
      oleh: "New immigrant (oleh chadash)",
      foreign: "Foreign resident",
    },
    buyerValues: {
      firstHome: "First home",
      replacingHome: "Replacing an existing home",
      investment: "Investment property",
    },
    inflationValues: { low: "Low (~1%/yr)", medium: "Medium (~2.5%/yr)", high: "High (~4%/yr)" },
    mixTitle: "Loan mix",
    trackCols: ["Track", "Share", "Rate", "Amount", "Monthly"],
    resultsTitle: "Results",
    labelsResults: {
      monthlyPayment: "Payment today (month one)",
      paymentYear: "Estimated payment in year {year}",
      totalInterest: "Total interest over the term",
      totalRepayment: "Total repayment",
      stress1: "Payment if Prime rises 1 point",
      stress2: "Payment if Prime rises 2 points",
    },
    costsTitle: "Cash to close",
    labelsCosts: {
      purchaseTax: "Purchase tax (mas rechisha)",
      legal: "Legal fees (incl. VAT)",
      agent: "Agent commission (incl. VAT)",
      other: "Appraiser & registration",
      costsTotal: "Costs beyond the loan",
      cashToClose: "Total cash to close",
    },
    yearsUnit: "years",
    footer:
      "Educational mortgage simulation by VryfID. This is not a bank quote. Confirm all figures with a licensed bank or mortgage advisor.",
  },
  common: { continueLabel: "Continue", backAria: "Back to the previous question", yes: "Yes", no: "No" },
};

const he: SimStrings = {
  welcome: {
    titleWords: ["בואו", "נבין", "את", "המשכנתא", "שלכם."],
    sub: "כמה שאלות קצרות בדרך לתמונה ריאלית של המשכנתא שלכם, ההחזר החודשי, התמהיל שמאחוריו, והמזומן האמיתי שתצטרכו לסגירה. בערך שתי דקות.",
    start: "מתחילים",
    caption: "בלי הרשמה · הערכה בלבד",
  },
  residency: {
    title: "מה מעמד התושבות שלכם בישראל?",
    helper: "זה משנה מאוד, גובה המימון שהבנק יכול לתת וההטבות שמגיעות לכם שונים מאוד בין התשובות.",
    israeli: { title: "תושב ישראל", sub: "גרים בישראל עם אזרחות או תושבות" },
    oleh: { title: "עולה חדש", sub: "ייתכנו הטבות נוספות" },
    foreign: { title: "תושב חוץ", sub: "קונים מחו״ל, מגבלות מימון מחמירות" },
  },
  aliyah: {
    title: "ספרו לנו על העלייה שלכם.",
    helper: "הטבות לעולים בדרך כלל תקפות בערך ב־10 עד 15 השנים הראשונות אחרי העלייה, תלוי בתוכנית.",
    yearsQuestion: "כמה שנים עברו מאז העלייה?",
    yearUnit: "שנה",
    yearsUnit: "שנים",
    lateWindowNote: "אחרי {years} שנים, חלק מחלונות ההטבה אולי נסגרים, כדאי לוודא אילו תוכניות עדיין רלוונטיות.",
    ownedQuestion: "האם הייתה בבעלותכם דירה בישראל בעבר?",
    ownedNote: "בעלות על נכס ב־10 השנים האחרונות משפיעה על הזכאות להלוואת זכאות ממשלתית.",
    yes: "כן",
    no: "לא",
    infoNote:
      "עולים חדשים יכולים בדרך כלל לקבל מימון של עד 75% משווי הנכס לעומת 50% לתושבי חוץ, ייתכן שיהיו זכאים להלוואת זכאות ממשלתית בריבית קבועה מופחתת, ולעיתים קרובות משלמים מס רכישה מופחת. הסימולטור נותן הערכה בלבד, יועץ משכנתאות מורשה צריך לאשר זכאות ותנאים בפועל.",
  },
  identity: {
    title: "בואו נאמת מי אתם.",
    helper: "דוח שמקושר לזהות מאומתת שווה יותר בעיני בנק ממספר אנונימי. זה לוקח כמה שניות.",
    nameLabel: "שם מלא רשמי",
    namePlaceholder: "כפי שמופיע בתעודת הזהות",
    idLabel: "מספר תעודת זהות",
    idPlaceholder: "9 ספרות",
    idInvalid: "זה לא נראה כמו מספר תעודת זהות תקין, בדקו את הספרות.",
    verifyButton: "אימות זהות",
    verifying: "מאמתים…",
    verifiedLabel: "הזהות אומתה דרך VryfID בתאריך {date}",
    editLink: "עריכה ואימות מחדש",
    methodNote: "זו בדיקה שהמספר תקין לפי ספרת הביקורת הרגילה של תעודת הזהות, לא בדיקה מול מרשם ממשלתי.",
  },
  buyerStatus: {
    title: "מה אתם קונים?",
    helper: "זה קובע איזה חלק מהמחיר הבנק רשאי לממן.",
    firstHome: { title: "דירה ראשונה בישראל", sub: "הנכס הראשון שלכם כאן" },
    replacingHome: { title: "משפרי דיור", sub: "מוכרים דירה אחת וקונים אחרת" },
    investment: { title: "דירה להשקעה", sub: "כבר יש לכם דירה למגורים" },
    olehNote: "כעולים חדשים, הבנקים יכולים בדרך כלל לממן עד {ceiling} משווי הנכס.",
    foreignNote: "כתושבי חוץ, המימון בדרך כלל מוגבל לסביבות {ceiling} משווי הנכס.",
    firstHomeNote: "לדירה ראשונה הבנקים יכולים לממן עד בערך {ceiling}, תכננו לפחות 25% הון עצמי.",
    replacingNote: "למשפרי דיור המימון מגיע עד בערך {ceiling} משווי הנכס החדש.",
    investmentNote: "לדירה להשקעה המימון מוגבל לסביבות {ceiling}, חצי מהמחיר מגיע מכם.",
  },
  existingHome: {
    title: "מה מצב הדירה הנוכחית שלכם?",
    helper: "זה משנה גם את אחוז המימון האמיתי שלכם וגם את מדרגת מס הרכישה, עוד לפני שהמכירה סגורה.",
    sold: { title: "כבר נמכרה", sub: "העסקה נסגרה" },
    underContract: { title: "בחוזה", sub: "חתום, ממתין לסגירה" },
    notListed: { title: "עדיין לא נמכרה או פורסמה", sub: "עדיין מחליטים לגבי התזמון" },
    bridgeNote:
      "מאחר שהמכירה עוד לא נסגרה, ייתכן שתידרש הלוואת גישור. אחוז המימון ומס הרכישה כאן מניחים שהמכירה תושלם בתוך החלון הרגיל להטבה, אחרת תחול זמנית מדרגת המס הגבוהה יותר של דירה נוספת.",
  },
  incomeDebt: {
    title: "הכנסה וחובות קיימים.",
    helper:
      "בנק ישראל מגביל את ההחזר הכולל ל־50% מההכנסה הפנויה של משק הבית, והבנקים בדרך כלל רוצים שזה יהיה בנוחות מתחת ל־40% כדי לזוז בלי חיכוך. זו המגבלה האמיתית, יותר ממחיר הנכס.",
    incomeLabel: "הכנסה נטו חודשית של משק הבית (לווה ראשי)",
    coApplicantToggle: "יש לווה נוסף?",
    coApplicantIncomeLabel: "הכנסה נטו חודשית של הלווה הנוסף",
    employmentLabel: "סוג העסקה",
    salaried: "שכיר",
    selfEmployed: "עצמאי",
    mixed: "שילוב של שניהם",
    employmentNoteSelfEmployed:
      "עצמאים בדרך כלל צריכים דוחות מס ומכתב רואה חשבון, הבנקים מתמחרים את הסיכון הזה קצת אחרת.",
    tenureLabel: "כמה שנים אצל המעסיק הנוכחי או בעסק",
    tenureNoteShort: "פחות משנה או שנתיים בעבודה יכול להקשות מול חלק מהבנקים, שידרשו וותק ארוך יותר.",
    debtLabel: "חובות חודשיים קיימים",
    debtNote: "הלוואת רכב, הלוואות אחרות, מסגרות אשראי, מזונות, כל דבר עם החזר חודשי קבוע.",
  },
  price: {
    title: "מה מחיר הנכס?",
    helper: "מספר משוער זה בסדר גמור, אפשר לחזור ולעדכן בכל שלב.",
    aria: "מחיר הנכס בשקלים",
  },
  down: {
    title: "כמה הון עצמי תוכלו להביא?",
    helper: "אפשר לקבוע בשקלים או באחוזים מהמחיר, שניהם מסונכרנים.",
    modeShekels: "סכום ב₪",
    modePercent: "% מהמחיר",
    pctOfPrice: "זה {pct}% מהמחיר.",
    amountIs: "זה {amount}.",
    loanAmount: "סכום ההלוואה",
    ltv: "אחוז מימון",
    warning: "זה מעל בערך {ceiling} שהבנקים יכולים לממן במצב שלכם, כנראה תצטרכו הון עצמי גדול יותר או נכס זול יותר.",
  },
  downPaymentSource: {
    title: "מאיפה מגיע ההון העצמי?",
    helper: "כאן הבנקים רוצים מסמכים, לא רק מספר.",
    savings: { title: "חיסכון", sub: "כספים שכבר הוקצו" },
    homeSale: { title: "מכירת הדירה הנוכחית", sub: "תמורה ממכירת הנכס שלכם" },
    gift: { title: "מתנה מהמשפחה", sub: "קרוב משפחה תורם" },
    other: { title: "אחר", sub: "משהו אחר לגמרי" },
    giftNote: "הבנקים ידרשו מכתב מתנה שמאשר שהכספים אינם הלוואה מוסווית.",
    homeSaleQuestion: "הכספים כבר בידיכם, או שעדיין ממתינים למכירה?",
    inHand: "כבר בידיים",
    pending: "עדיין ממתין",
    pendingNote: "עד שהמכירה תיסגר, הבנק בדרך כלל ירצה תוכנית גישור או הוכחה לתמורה הצפויה.",
  },
  term: {
    title: "לכמה שנים?",
    helper: "25 שנים זו הבחירה הנפוצה בישראל. תקופה ארוכה יותר אומרת החזר חודשי נמוך יותר אבל יותר ריבית בסך הכול.",
    yearsUnit: "שנים",
  },
  mix: {
    title: "בנו את התמהיל שלכם.",
    helper:
      "משכנתא ישראלית מפוצלת בין מסלולים, לכל אחד התנהגות ריבית משלו. רוב האנשים משלבים את שלושתם, התחילו מתמהיל מוכן וכווננו.",
    presets: { balanced: "מאוזן", stability: "יציבות ריבית", lowest: "החזר נמוך" },
    primeCapWarning: "הוראות בנק ישראל מגבילות את הפריים לשני שליש מהתמהיל, יותר מ־66% כאן לא יעמוד בדרישות החיתום.",
    fixedFloorWarning: "לפחות שליש מהתמהיל חייב לשבת במסלול בריבית קבועה, העלו אחד מהם.",
    paymentPreview: "החזר חודשי משוער עם התמהיל הזה",
    inflationNote: "מניח אינפלציה של בערך 2.5% בשנה (יעד בנק ישראל) על המסלול הצמוד למדד.",
    dtiPreviewLabel: "יחס החזר מהכנסה עם התמהיל הזה",
    dtiWarning: "זה מעל קו הנוחות של 40% שהבנקים בדרך כלל משתמשים בו, 50% הוא התקרה החוקית.",
  },
  tracks: {
    prime: { name: "פריים", tagline: "צמוד לריבית בנק ישראל, יכול להשתנות בכל חודש" },
    kalatz: { name: "קבועה לא צמודה (קל״צ)", tagline: "אותו החזר כל חודש, לא צמוד למדד" },
    katz: { name: "קבועה צמודה למדד (ק״צ)", tagline: "ריבית קבועה נמוכה, אבל הקרן צמודה למדד" },
  },
  inflation: {
    title: "איך תתנהג האינפלציה?",
    helper:
      "אף אחד לא יודע, וזה בדיוק העניין. זה משפיע רק על החלק הצמוד למדד בתמהיל, וזו העלות ארוכת הטווח שמחשבון רגיל מסתיר.",
    low: { title: "נמוכה, בערך 1% בשנה", sub: "המדד נשאר רגוע" },
    medium: { title: "בינונית, בערך 2.5% בשנה", sub: "קרוב ליעד בנק ישראל" },
    high: { title: "גבוהה, בערך 4% בשנה", sub: "המחירים רצים שנים" },
    linkedNote: "{share}% מהתמהיל שלכם צמוד למדד, אז התרחיש הזה נצבר בקצב {rate} בשנה על החלק הזה.",
    noneNote: "אין לכם כרגע מסלול צמוד מדד בתמהיל, אז הבחירה הזו כמעט לא מזיזה את המספרים.",
  },
  costs: {
    title: "העלות האמיתית של הסגירה.",
    helper: "מעבר להון העצמי, תכננו את אלה. ברירות המחדל אופייניות לעסקאות בישראל, ערכו כל שדה שיתאים לעסקה שלכם.",
    purchaseTaxLabel: "מס רכישה",
    purchaseTaxNoteOleh: "ההערכה כוללת הנחת עולה חדש אפשרית, ודאו את הזכאות שלכם.",
    purchaseTaxNote: "הערכה לפי מדרגות מפושטות, הסכום המדויק תלוי בעסקה.",
    resetToEstimate: "חזרה להערכה ({amount})",
    legalLabel: "שכר טרחת עורך דין",
    legalNote: "בתוספת מע״מ, הטווח המקובל הוא 0.5% עד 1.5% מהמחיר.",
    agentLabel: "דמי תיווך",
    agentNote: "בתוספת מע״מ, קבעו 0 אם אין מתווך.",
    otherLabel: "שמאי ורישום",
    otherNote: "שמאות, רישום ופתיחת תיק משכנתא.",
    vatIncl: "≈ {amount} כולל מע״מ",
    costsTotal: "עלויות מעבר להלוואה",
    cashTotal: "סך המזומן לסגירה (כולל הון עצמי)",
    continueLabel: "לדוח שלי",
  },
  creditStanding: {
    title: "המצב האשראי שלכם, כפי שאתם מבינים אותו.",
    helper:
      "דוח אשראי אמיתי דורש גישה בנקאית או מורשית, הסימולטור הזה לא יכול לבדוק את זה. ענו בכנות, הבנק שלכם יבצע בדיקה עצמאית בכל מקרה.",
    missedPaymentsQuestion: "היו פיגורים בתשלומים בשנתיים האחרונות?",
    collectionsQuestion: "יש הליכי גבייה פעילים?",
    bankruptcyQuestion: "יש היסטוריה של פשיטת רגל?",
    yes: "כן",
    no: "לא",
    disclosureNote: "התשובות האלה לא מדורגות ולא נבדקות כאן. הבנק שלכם יבצע בדיקת אשראי עצמאית בכל מקרה.",
  },
  report: {
    confirmsTitle: "מה זה מאשר",
    stillNeedsTitle: "מה שהבנק עדיין יצטרך",
    identityLine: "הזהות אומתה דרך VryfID בתאריך {date}.",
    dtiConfirmLine: "הכנסה ויחס החזר מהכנסה חושבו: {dti}.",
    dtiWarningFriction:
      "יחס ההחזר מהכנסה הוא {dti}, מעל קו הנוחות של 40% שהבנקים בדרך כלל משתמשים בו. צפו לבדיקה מוקפדת יותר או להלוואה קטנה יותר.",
    dtiWarningHard:
      "יחס ההחזר מהכנסה הוא {dti}, מעל התקרה החוקית של 50% של בנק ישראל. זה דורש הלוואה קטנה יותר, הכנסה גבוהה יותר, או פחות חוב קיים לפני שזה יחזיק מעמד.",
    downPaymentSourceConfirmLine: "מקור ההון העצמי תועד ({source}).",
    variableWithinLimitLine: "התמהיל בתוך מגבלת החשיפה לריבית משתנה של בנק ישראל.",
    variableOverLimitWarning: "התמהיל הזה חורג ממגבלת הפריים של שני שליש. התאימו אותו לפני שמתייחסים לדוח כמוכן לבנק.",
    consistencyConfirmLine: "הנתונים עקביים פנימית בין המחיר, התמהיל, והעלויות.",
    paymentTodayLabel: "החזר היום (חודש ראשון)",
    paymentYearLabel: "החזר משוער בשנה ה־{year}",
    paymentGrowNote: "החלק הצמוד למדד בתמהיל שלכם גדל עם המדד, אז ההחזר של החודש הראשון הוא לא המספר לצטט לאורך כל חיי ההלוואה.",
    rateNoteUnderTable: "הריביות המוצגות הן להמחשה בלבד ומשתנות מדי שבוע, אמתו את הריבית העדכנית מול הבנק.",
    bridgeCaution:
      "הדירה הנוכחית עדיין לא נמכרה, אז אחוז המימון ומס הרכישה כאן מניחים שהמכירה תושלם בזמן. אחרת תחול זמנית הלוואת גישור ומדרגת המס הגבוהה יותר של דירה נוספת.",
    stillNeeds: {
      identityPending: "אימות זהות, לא הושלם במהלך השימוש הזה.",
      credit: "דוח אשראי עצמאי, ההצהרה העצמית כאן לא מחליפה אותו.",
      incomeDocsSalaried: "תלושי שכר עדכניים שמאשרים את ההכנסה שהוזנה.",
      incomeDocsSelfEmployed: "דוחות מס ומכתב רואה חשבון שמאשרים את ההכנסה.",
      incomeDocsMixed: "תלושי שכר בתוספת דוחות מס שמכסים את שני מקורות ההכנסה.",
      appraisal: "שמאות לנכס.",
      finalRate: "הצעת ריבית סופית מהבנק הספציפי, הריביות כאן להמחשה בלבד.",
    },
  },
  summary: {
    crunch: ["מערבבים את התמהיל…", "מקרינים את המדד…", "בודקים תרחיש עליית פריים…"],
    title: "דוח המוכנות למשכנתא שלכם.",
    heroSub: "משוקלל על פני התמהיל שלכם לאורך {years} שנים",
    totalInterest: "סך הריבית",
    totalRepayment: "סך ההחזר",
    ltv: "אחוז מימון",
    ltvSub: "על נכס של {price}",
    cashToClose: "מזומן לסגירה",
    cashSub: "הון עצמי בתוספת מיסים ועמלות",
    mixTitle: "התמהיל שלכם",
    perMonth: "/חודש",
    stressTitle: "אם הפריים עולה",
    stressUp1: "פריים עולה נקודה אחת:",
    stressUp2: "פריים עולה שתי נקודות:",
    disclaimer:
      "זו הערכה למטרות תכנון בלבד, לא הצעה מחייבת. ריביות, מדרגות מס וכללי זכאות משתנים, יועץ משכנתאות מורשה צריך לאשר תנאים אמיתיים מול בנק.",
    startOver: "להתחיל מחדש",
  },
  exportPanel: {
    title: "קחו את הדוח איתכם",
    sub: "הורידו סיכום PDF ממותג להביא לבנק או ליועץ.",
    downloadHe: "הורדת PDF · עברית",
    downloadEn: "הורדת PDF · English",
    downloadBoth: "הורדת שניהם",
    banksTitle: "לאן ממשיכים מכאן",
    banksNote: "פתחו את עמוד המשכנתאות של הבנק כדי להתחיל אישור עקרוני. קישורים רגילים, ללא שיוך.",
    call: "חיוג",
    visit: "לאתר",
  },
  nextSteps: {
    title: "הצעדים הבאים שלכם",
    steps: [
      {
        title: "השיגו אישור עקרוני",
        body: "בקשו אישור עקרוני מ־2 או 3 בנקים על בסיס המספרים האלה. זה חינם ולא מחייב אתכם.",
      },
      {
        title: "השוו תמהילים, לא רק ריביות",
        body: "כל בנק יציע תמהיל משלו. השתמשו בדוח הזה כבסיס כדי להשוות תפוחים לתפוחים.",
      },
      {
        title: "דברו עם יועץ מורשה",
        body: "יועץ משכנתאות יכול להתמקח על ריביות ולאשר הטבות שאולי מגיעות לכם.",
      },
    ],
  },
  print: {
    title: "דוח מוכנות למשכנתא של VryfID",
    subtitle: "נתונים משוערים על בסיס הנתונים שהוזנו, בכפוף לחיתום הבנק",
    generated: "הופק {date} על ידי VryfID",
    inputsTitle: "הנתונים שלכם",
    labels: {
      residency: "תושבות",
      buyerStatus: "סוג רכישה",
      existingHomeStatus: "מצב הדירה הנוכחית",
      propertyPrice: "מחיר הנכס",
      downPayment: "הון עצמי",
      downPaymentSource: "מקור ההון העצמי",
      loanAmount: "סכום ההלוואה",
      term: "תקופה",
      inflation: "תרחיש אינפלציה",
      income: "הכנסה נטו חודשית של משק הבית",
      employment: "סוג העסקה",
      tenure: "שנים אצל המעסיק או בעסק",
      debt: "חוב חודשי קיים",
      dti: "יחס החזר מהכנסה",
    },
    residencyValues: { israeli: "תושב ישראל", oleh: "עולה חדש", foreign: "תושב חוץ" },
    buyerValues: { firstHome: "דירה ראשונה", replacingHome: "משפרי דיור", investment: "דירה להשקעה" },
    inflationValues: { low: "נמוכה (~1% בשנה)", medium: "בינונית (~2.5% בשנה)", high: "גבוהה (~4% בשנה)" },
    mixTitle: "תמהיל ההלוואה",
    trackCols: ["מסלול", "נתח", "ריבית", "סכום", "החזר חודשי"],
    resultsTitle: "תוצאות",
    labelsResults: {
      monthlyPayment: "החזר היום (חודש ראשון)",
      paymentYear: "החזר משוער בשנה ה־{year}",
      totalInterest: "סך הריבית לאורך התקופה",
      totalRepayment: "סך ההחזר",
      stress1: "החזר אם הפריים עולה נקודה",
      stress2: "החזר אם הפריים עולה שתי נקודות",
    },
    costsTitle: "מזומן לסגירה",
    labelsCosts: {
      purchaseTax: "מס רכישה",
      legal: "שכר טרחת עו״ד (כולל מע״מ)",
      agent: "דמי תיווך (כולל מע״מ)",
      other: "שמאי ורישום",
      costsTotal: "עלויות מעבר להלוואה",
      cashToClose: "סך המזומן לסגירה",
    },
    yearsUnit: "שנים",
    footer: "סימולציית משכנתא לימודית של VryfID. זו אינה הצעת בנק. אמתו את כל הנתונים מול בנק או יועץ משכנתאות מורשה.",
  },
  common: { continueLabel: "המשך", backAria: "חזרה לשאלה הקודמת", yes: "כן", no: "לא" },
};

export const SIM_TEXTS: Record<Lang, SimStrings> = { en, he };
