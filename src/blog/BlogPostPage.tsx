import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BlogLayout } from "./BlogLayout";
import { BLOG_STRINGS } from "./blogStrings";
import { TableOfContents } from "./TableOfContents";
import { RelatedPosts } from "./RelatedPosts";
import { FloatingBackToBlog } from "./FloatingBackToBlog";
import { relatedPosts, type BlogLang, type BlogPost } from "./markdown";
import { useLang } from "../i18n";

function formatDate(iso: string, lang: BlogLang): string {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  const locale = lang === "he" ? "he-IL" : "en-US";
  return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

/**
 * Pure presentational component, same reasoning as BlogIndexPage: takes
 * `post` and `allPosts` as props so it's safe to import and render with
 * ReactDOMServer.renderToStaticMarkup from the plain-Node prerender script,
 * which has no `document` and can't run import.meta.glob. The useEffect
 * below only ever runs in a real browser mount (React never invokes
 * effects during renderToStaticMarkup), so it's safe without extra guards.
 *
 * `hasCounterpart` decides whether the language switcher renders at all:
 * every post in this pass has both an English and Hebrew version, but the
 * component doesn't assume that going forward, a future post published in
 * only one language shouldn't show a switcher pointing at a 404.
 */
export function BlogPostPage({
  post,
  allPosts,
  hasCounterpart,
}: {
  post: BlogPost;
  allPosts: BlogPost[];
  hasCounterpart: boolean;
}) {
  const lang = post.lang;
  const s = BLOG_STRINGS[lang];
  const prefix = lang === "he" ? "/he/blog" : "/blog";
  const { setLang } = useLang();
  const syncWizardLang = () => setLang(lang);

  useEffect(() => {
    document.title = `${post.frontmatter.title} | ${s.eyebrow}`;
  }, [post.frontmatter.title, s.eyebrow]);

  const related = relatedPosts(post, allPosts);
  const switchHref = hasCounterpart
    ? lang === "he"
      ? `/blog/${post.slug}`
      : `/he/blog/${post.slug}`
    : null;

  return (
    <BlogLayout lang={lang} switchHref={switchHref}>
      <FloatingBackToBlog lang={lang} />
      <Link to={prefix} className="mb-6 inline-block text-sm font-semibold text-accentDeep hover:underline">
        {lang === "he" ? `${s.allPosts} →` : `← ${s.allPosts}`}
      </Link>

      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-inkMuted">
            <time dateTime={post.frontmatter.date}>{formatDate(post.frontmatter.date, lang)}</time>
            <span aria-hidden="true">·</span>
            <span>{s.minRead(post.readMinutes)}</span>
          </div>
          {/* Single H1 per page: the post title. Every section break inside
              the body below is an H2 (see markdown.ts / content/blog/*.md),
              never skipping to H3 without an H2 parent, so heading order
              stays clean for the table of contents and for screen readers. */}
          <h1 className="mb-3 font-serif text-3xl leading-tight text-ink sm:text-4xl">
            {post.frontmatter.title}
          </h1>
          <p className="text-base text-inkMuted">{post.frontmatter.description}</p>
        </header>

        <TableOfContents entries={post.toc} lang={lang} />

        <div className="blogArticle" dangerouslySetInnerHTML={{ __html: post.html }} />
      </motion.article>

      <RelatedPosts posts={related} lang={lang} />

      <div className="mt-12 rounded-2xl border border-hairline bg-card p-6 text-center shadow-lift">
        <p className="mb-3 font-serif text-xl text-ink">{s.ctaTitle}</p>
        <p className="mb-4 text-sm text-inkMuted">{s.ctaSub}</p>
        <Link
          to="/simulator/welcome"
          onClick={syncWizardLang}
          className="inline-block rounded-pill bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lift transition-colors hover:bg-accentDeep"
        >
          {s.ctaButton}
        </Link>
      </div>
    </BlogLayout>
  );
}
