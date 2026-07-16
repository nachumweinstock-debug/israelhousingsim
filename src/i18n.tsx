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
