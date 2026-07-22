import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { VryfIDFooter } from "../components/VryfIDFooter";

/**
 * Lightweight chrome for the blog section, deliberately separate from
 * FlowChrome in SimulatorApp.tsx: the wizard header carries a progress bar
 * and a step-based back button, neither of which makes sense on a blog
 * page. Same cream/ink/accent design tokens and VryfIDFooter, so it still
 * reads as one product.
 */
export function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream font-sans text-ink">
      <header className="border-b border-hairline bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
          <Link to="/blog" className="flex items-center gap-2.5">
            <img
              src="/vryfid-full-logo.jpeg"
              alt="VryfID"
              className="h-9 w-auto rounded-lg border border-hairline bg-card p-1 shadow-lift"
            />
            <span className="text-sm font-semibold uppercase tracking-widest text-inkMuted">
              Blog
            </span>
          </Link>
          <Link
            to="/simulator/welcome"
            className="shrink-0 rounded-pill bg-accent px-3.5 py-2 text-xs font-semibold text-white shadow-lift transition-colors hover:bg-accentDeep sm:text-sm"
          >
            Try the mortgage calculator →
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:py-14">{children}</main>

      <div className="mt-16">
        <VryfIDFooter />
      </div>
    </div>
  );
}
