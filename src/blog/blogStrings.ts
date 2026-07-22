import type { BlogLang } from "./markdown";

export interface BlogStrings {
  blogLabel: string;
  tryCalculator: string;
  eyebrow: string;
  indexTitle: string;
  indexSub: string;
  minRead: (n: number) => string;
  readPost: string;
  allPosts: string;
  tocHeading: string;
  relatedHeading: string;
  ctaTitle: string;
  ctaSub: string;
  ctaButton: string;
  langSwitchTo: string;
}

const en: BlogStrings = {
  blogLabel: "Blog",
  tryCalculator: "Try the mortgage calculator →",
  eyebrow: "VryfID Mortgage Blog",
  indexTitle: "Straight answers on Israeli mortgages.",
  indexSub:
    "Plain-language explainers on LTV limits, loan tracks, payment-to-income, closing costs, and the other numbers that decide what a bank will actually offer you.",
  minRead: (n) => `${n} min read`,
  readPost: "Read the post →",
  allPosts: "All posts",
  tocHeading: "In this post",
  relatedHeading: "Related reading",
  ctaTitle: "See where your own numbers land.",
  ctaSub: "Two minutes, no signup, bilingual, and it shows you the exact figures a bank will look at.",
  ctaButton: "Try the mortgage calculator →",
  langSwitchTo: "עברית",
};

const he: BlogStrings = {
  blogLabel: "בלוג",
  tryCalculator: "← נסו את הסימולטור",
  eyebrow: "בלוג המשכנתאות של VryfID",
  indexTitle: "תשובות ברורות על משכנתאות בישראל.",
  indexSub:
    "הסברים בשפה פשוטה על אחוז מימון, מסלולי הלוואה, יחס החזר, עלויות סגירת עסקה, והמספרים האחרים שקובעים מה הבנק בעצם יציע לכם.",
  minRead: (n) => `${n} דקות קריאה`,
  readPost: "לקריאת המאמר ←",
  allPosts: "כל המאמרים",
  tocHeading: "תוכן העניינים",
  relatedHeading: "מאמרים קשורים",
  ctaTitle: "בואו לראות איפה המספרים שלכם עומדים.",
  ctaSub:
    "שתי דקות, בלי הרשמה, דו־לשוני, ומציג את המספרים המדויקים שהבנק יבדוק.",
  ctaButton: "← נסו את הסימולטור",
  langSwitchTo: "EN",
};

export const BLOG_STRINGS: Record<BlogLang, BlogStrings> = { en, he };
