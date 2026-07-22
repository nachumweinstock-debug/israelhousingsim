import { BLOG_STRINGS } from "./blogStrings";
import type { BlogLang, TocEntry } from "./markdown";

/** Only worth showing for posts with enough sections to actually need a map. */
export const TOC_MIN_HEADINGS = 3;

export function TableOfContents({ entries, lang }: { entries: TocEntry[]; lang: BlogLang }) {
  if (entries.length < TOC_MIN_HEADINGS) return null;
  const s = BLOG_STRINGS[lang];
  return (
    <nav
      aria-label={s.tocHeading}
      className="mb-8 rounded-2xl border border-hairline bg-card p-5 shadow-lift"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accentDeep">
        {s.tocHeading}
      </p>
      <ol className="space-y-2">
        {entries.map((entry, index) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className="flex gap-2.5 text-sm text-inkMuted transition-colors hover:text-accentDeep"
            >
              <span className="tabular-nums text-accentSoft" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{entry.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
