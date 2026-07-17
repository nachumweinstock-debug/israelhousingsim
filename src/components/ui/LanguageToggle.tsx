import { useLang, type Lang } from "../../i18n";

const CHOICES: Array<{ value: Lang; label: string }> = [
  { value: "en", label: "EN" },
  { value: "he", label: "עברית" },
];

/** Fixed top-left EN/Hebrew switch, visible on every screen. */
export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div
      className="fixed top-4 z-50 flex items-center gap-0.5 rounded-full border border-warm-border bg-white/90 p-1 shadow-md backdrop-blur print:hidden"
      style={{ left: "1rem" }}
    >
      {CHOICES.map((c) => (
        <button
          key={c.value}
          onClick={() => setLang(c.value)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-150 ${
            lang === c.value ? "bg-navy text-cream" : "text-navy-mid/60 hover:text-navy"
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
