import { useLang } from "../i18n";
import { SIM_TEXTS } from "./texts";
import type { SimStrings } from "./texts";
import type { Lang } from "../i18n";

/**
 * Simulator flavored wrapper around the shared LanguageProvider: same
 * lang state and RTL handling, but resolves the simulator's own catalog.
 */
export function useSimLang(): {
  lang: Lang;
  setLang: (l: Lang) => void;
  s: SimStrings;
  isHe: boolean;
} {
  const { lang, setLang } = useLang();
  return { lang, setLang, s: SIM_TEXTS[lang], isHe: lang === "he" };
}
