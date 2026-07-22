import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { VryfIDFooter } from "../components/VryfIDFooter";
import { useLang } from "../i18n";
import { BLOG_STRINGS } from "./blogStrings";
import type { BlogLang } from "./markdown";

/**
 * Lightweight chrome for the blog section, deliberately separate from
 * FlowChrome in SimulatorApp.tsx: the wizard header carries a progress bar
 * and a step-based back button, neither of which makes sense on a blog
 * page. Same cream/ink/accent design tokens and VryfIDFooter, so it still
 * reads as one product.
 *
 * `lang` drives `dir` explicitly rather than reading it off the document:
 * this section is mounted under the same LanguageProvider as the bilingual
 * wizard, so without an explicit per-page override it would silently
 * inherit document.documentElement's dir from whatever the wizard's
 * language toggle last left it at, the exact dir-inheritance bug class
 * already fixed elsewhere in this app (see PoweredByPill in
 * SimulatorApp.tsx). Each blog post has a real, fixed language (it's a
 * translated file, not a live-toggle view of the same content), so `lang`
 * comes from the route/post data, not from shared app state, and an
 * English post never flips to RTL just because a Hebrew wizard session is
 * active, while a Hebrew post always renders RTL regardless of it.
 */
export function BlogLayout({
  children,
  lang,
  wide = false,
  switchHref = null,
}: {
  children: ReactNode;
  lang: BlogLang;
  wide?: boolean;
  switchHref?: string | null;
}) {
  const s = BLOG_STRINGS[lang];
  const dir = lang === "he" ? "rtl" : "ltr";
  const { setLang } = useLang();
  // A deliberate click into the wizard is a reasonable moment to also
  // switch the wizard's own (separately-stored) language state to match
  // what the reader was just reading, so they don't land on an English
  // wizard straight out of a Hebrew post. Merely *viewing* a blog page
  // never touches this app-wide preference, only this explicit handoff.
  const syncWizardLang = () => setLang(lang);

  return (
    <div dir={dir} lang={lang} className="flex min-h-screen flex-col bg-cream font-sans text-ink">
      <header className="border-b border-hairline bg-cream/90 backdrop-blur-sm">
        <div
          className={`mx-auto flex items-center justify-between gap-3 px-4 py-4 ${wide ? "max-w-5xl" : "max-w-3xl"}`}
        >
          <Link to={lang === "he" ? "/he/blog" : "/blog"} className="flex items-center gap-2.5">
            <img
              src="/vryfid-full-logo.jpeg"
              alt="VryfID"
              width={160}
              height={160}
              className="h-9 w-auto rounded-lg border border-hairline bg-card p-1 shadow-lift"
            />
            <span className="text-sm font-semibold uppercase tracking-widest text-inkMuted">
              {s.blogLabel}
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            {switchHref ? (
              <Link
                to={switchHref}
                className="rounded-pill border border-hairline bg-card px-3 py-2 text-xs font-semibold text-inkMuted shadow-lift transition-colors hover:text-accentDeep sm:text-sm"
              >
                {s.langSwitchTo}
              </Link>
            ) : null}
            <Link
              to="/simulator/welcome"
              onClick={syncWizardLang}
              className="rounded-pill bg-accent px-3.5 py-2 text-xs font-semibold text-white shadow-lift transition-colors hover:bg-accentDeep sm:text-sm"
            >
              {s.tryCalculator}
            </Link>
          </div>
        </div>
      </header>

      <main
        className={`mx-auto w-full flex-1 px-4 py-10 sm:py-14 ${wide ? "max-w-5xl" : "max-w-3xl"}`}
      >
        {children}
      </main>

      <div className="mt-16" dir="ltr" lang="en">
        <VryfIDFooter />
      </div>
    </div>
  );
}
