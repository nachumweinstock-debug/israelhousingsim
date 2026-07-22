import { Link } from "react-router-dom";
import { BLOG_STRINGS } from "./blogStrings";
import type { BlogLang, BlogPost } from "./markdown";

export function RelatedPosts({ posts, lang }: { posts: BlogPost[]; lang: BlogLang }) {
  if (posts.length === 0) return null;
  const s = BLOG_STRINGS[lang];
  const prefix = lang === "he" ? "/he/blog" : "/blog";
  return (
    <section className="mt-12">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-accentDeep">
        {s.relatedHeading}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={`${prefix}/${post.slug}`}
            className="group flex flex-col rounded-2xl border border-hairline bg-card p-4 shadow-lift transition-all duration-200 hover:-translate-y-0.5 hover:shadow-liftHover"
          >
            <span className="mb-1 text-xs text-inkMuted">{s.minRead(post.readMinutes)}</span>
            <span className="text-sm font-bold leading-snug text-ink transition-colors group-hover:text-accentDeep">
              {post.frontmatter.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
