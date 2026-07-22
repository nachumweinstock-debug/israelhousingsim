import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BlogLayout } from "./BlogLayout";
import { BLOG_STRINGS } from "./blogStrings";
import type { BlogLang, BlogPost } from "./markdown";

function formatDate(iso: string, lang: BlogLang): string {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  const locale = lang === "he" ? "he-IL" : "en-US";
  return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

/**
 * Pure presentational component: takes `posts` as a prop rather than
 * importing BLOG_POSTS itself, so it can be rendered both client-side
 * (Vite bundle, posts loaded via import.meta.glob) and server-side by
 * scripts/build-blog.tsx (plain Node fs, no Vite macros available there).
 */
export function BlogIndexPage({ posts, lang }: { posts: BlogPost[]; lang: BlogLang }) {
  const s = BLOG_STRINGS[lang];
  const prefix = lang === "he" ? "/he/blog" : "/blog";
  const switchHref = lang === "he" ? "/blog" : "/he/blog";

  return (
    <BlogLayout wide lang={lang} switchHref={switchHref}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accentDeep">
          {s.eyebrow}
        </p>
        <h1 className="mb-3 font-serif text-3xl text-ink sm:text-4xl">{s.indexTitle}</h1>
        <p className="mb-10 max-w-xl text-inkMuted">{s.indexSub}</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {posts.map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: Math.min(index, 6) * 0.05,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Link
              to={`${prefix}/${post.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-hairline bg-card p-5 shadow-lift transition-all duration-200 hover:-translate-y-0.5 hover:shadow-liftHover sm:p-6"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-inkMuted">
                <time dateTime={post.frontmatter.date}>{formatDate(post.frontmatter.date, lang)}</time>
                <span aria-hidden="true">·</span>
                <span>{s.minRead(post.readMinutes)}</span>
              </div>
              <h2 className="mb-1.5 text-lg font-bold text-ink transition-colors group-hover:text-accentDeep sm:text-xl">
                {post.frontmatter.title}
              </h2>
              <p className="text-sm leading-relaxed text-inkMuted">{post.frontmatter.description}</p>
              <span className="mt-4 text-sm font-semibold text-accentDeep opacity-0 transition-opacity group-hover:opacity-100">
                {s.readPost}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </BlogLayout>
  );
}
