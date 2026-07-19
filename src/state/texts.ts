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
  term: { title: string; helper: string; yearsUnit: string };
  mix: {
    title: string;
    helper: string;
    presets: { balanced: string; stability: string; lowest: string };
    primeCapWarning: string;
    fixedFloorWarning: string;
    paymentPreview: string;
    inflationNote: string;
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
  summary: {
    crunch: string[];
    title: string;
    heroLabel: string;
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
      propertyPrice: string;
      downPayment: string;
      loanAmount: string;
      term: string;
      inflation: string;
    };
    residencyValues: { israeli: string; oleh: string; foreign: string };
    buyerValues: { firstHome: string; replacingHome: string; investment: string };
    inflationValues: { low: string; medium: string; high: string };
    mixTitle: string;
    trackCols: string[];
    resultsTitle: string;
    labelsResults: {
      monthlyPayment: string;
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
  common: { continueLabel: string; backAria: string };
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
      "Bank of Israel rules cap the Prime track at two thirds of the mix, banks won't approve more than 66% here.",
    fixedFloorWarning:
      "At least a third of the mix has to sit in a fixed rate track, nudge one of them up.",
    paymentPreview: "Estimated monthly payment with this mix",
    inflationNote:
      "Assumes inflation of about 2.5% a year (the Bank of Israel target) on the inflation linked track.",
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
    continueLabel: "See my plan",
  },
  summary: {
    crunch: ["Blending your loan mix…", "Projecting inflation…", "Stress testing the Prime rate…"],
    title: "Your mortgage plan.",
    heroLabel: "Estimated monthly payment",
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
    title: "Take this plan with you",
    sub: "Download a branded PDF summary to bring to a bank or advisor.",
    downloadHe: "Download PDF · עברית",
    downloadEn: "Download PDF · English",
    downloadBoth: "Download both",
    banksTitle: "Where to take it next",
    banksNote:
      "Open a bank's mortgage page to start a pre approval (ishur ikroni). Plain links, no affiliation.",
    call: "Call",
    visit: "Visit",
  },
  nextSteps: {
    title: "Your next steps",
    steps: [
      {
        title: "Get a pre approval (ishur ikroni)",
        body: "Ask 2 or 3 banks for a pre approval based on these numbers. It's free and doesn't commit you.",
      },
      {
        title: "Compare mixes, not just rates",
        body: "Banks will each quote their own mix. Use this plan as your baseline so you can compare like for like.",
      },
      {
        title: "Talk to a licensed advisor",
        body: "A mortgage advisor (yoetz mashkantaot) can negotiate rates and confirm benefits you may be entitled to.",
      },
    ],
  },
  print: {
    title: "VryfID Mortgage Plan",
    subtitle: "Israeli mortgage simulation summary",
    generated: "Generated {date} by VryfID",
    inputsTitle: "Your inputs",
    labels: {
      residency: "Residency",
      buyerStatus: "Buying",
      propertyPrice: "Property price",
      downPayment: "Down payment",
      loanAmount: "Loan amount",
      term: "Term",
      inflation: "Inflation scenario",
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
      monthlyPayment: "Estimated monthly payment",
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
  common: { continueLabel: "Continue", backAria: "Back to the previous question" },
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
    primeCapWarning: "הוראות בנק ישראל מגבילות את הפריים לשני שליש מהתמהיל, הבנקים לא יאשרו יותר מ־66% כאן.",
    fixedFloorWarning: "לפחות שליש מהתמהיל חייב לשבת במסלול בריבית קבועה, העלו אחד מהם.",
    paymentPreview: "החזר חודשי משוער עם התמהיל הזה",
    inflationNote: "מניח אינפלציה של בערך 2.5% בשנה (יעד בנק ישראל) על המסלול הצמוד למדד.",
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
    continueLabel: "לתוכנית שלי",
  },
  summary: {
    crunch: ["מערבבים את התמהיל…", "מקרינים את המדד…", "בודקים תרחיש עליית פריים…"],
    title: "תוכנית המשכנתא שלכם.",
    heroLabel: "החזר חודשי משוער",
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
    title: "קחו את התוכנית איתכם",
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
        body: "כל בנק יציע תמהיל משלו. השתמשו בתוכנית הזו כבסיס כדי להשוות תפוחים לתפוחים.",
      },
      {
        title: "דברו עם יועץ מורשה",
        body: "יועץ משכנתאות יכול להתמקח על ריביות ולאשר הטבות שאולי מגיעות לכם.",
      },
    ],
  },
  print: {
    title: "תוכנית המשכנתא של VryfID",
    subtitle: "סיכום סימולציית משכנתא ישראלית",
    generated: "הופק {date} על ידי VryfID",
    inputsTitle: "הנתונים שלכם",
    labels: {
      residency: "תושבות",
      buyerStatus: "סוג רכישה",
      propertyPrice: "מחיר הנכס",
      downPayment: "הון עצמי",
      loanAmount: "סכום ההלוואה",
      term: "תקופה",
      inflation: "תרחיש אינפלציה",
    },
    residencyValues: { israeli: "תושב ישראל", oleh: "עולה חדש", foreign: "תושב חוץ" },
    buyerValues: { firstHome: "דירה ראשונה", replacingHome: "משפרי דיור", investment: "דירה להשקעה" },
    inflationValues: { low: "נמוכה (~1% בשנה)", medium: "בינונית (~2.5% בשנה)", high: "גבוהה (~4% בשנה)" },
    mixTitle: "תמהיל ההלוואה",
    trackCols: ["מסלול", "נתח", "ריבית", "סכום", "החזר חודשי"],
    resultsTitle: "תוצאות",
    labelsResults: {
      monthlyPayment: "החזר חודשי משוער",
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
  common: { continueLabel: "המשך", backAria: "חזרה לשאלה הקודמת" },
};

export const SIM_TEXTS: Record<Lang, SimStrings> = { en, he };
