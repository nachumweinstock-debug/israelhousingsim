import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BLOG_STRINGS } from "./blogStrings";
import type { BlogLang } from "./markdown";

/**
 * A floating "back to blog" pill that follows the reader down a long post,
 * so it never feels like a dead end the way a single top-of-page link
 * does once you've scrolled a screen or two away from it. Only mounts its
 * scroll listener in a real browser: this never runs during the Node
 * prerender pass (React doesn't execute effects in renderToStaticMarkup),
 * so the prerendered HTML simply omits it, which is fine since the inline
 * "All posts" link at the top of the article already covers that case for
 * anyone reading before JS takes over.
 *
 * Before: `left-6` pinned this to the physical left edge always, so on a
 * Hebrew (RTL) post it sat on the trailing edge instead of the leading
 * one, the far side from where a reader's eye actually starts, the same
 * physical-vs-logical CSS bug class already fixed elsewhere in this app.
 * After: `start-6` (inset-inline-start) follows the reading direction,
 * landing bottom-left in English and bottom-right in Hebrew.
 */
export function FloatingBackToBlog({ lang }: { lang: BlogLang }) {
  const [visible, setVisible] = useState(false);
  const s = BLOG_STRINGS[lang];

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 start-6 z-50"
        >
          <Link
            to={lang === "he" ? "/he/blog" : "/blog"}
            className="flex items-center gap-2 rounded-pill border border-hairline bg-card px-4 py-2.5 text-sm font-semibold text-ink shadow-liftHover transition-colors hover:text-accentDeep"
          >
            <span aria-hidden="true">{lang === "he" ? "→" : "←"}</span>
            {s.allPosts}
          </Link>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
