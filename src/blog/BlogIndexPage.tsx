import { Link } from "react-router-dom";
import { BlogLayout } from "./BlogLayout";
import type { BlogPost } from "./markdown";

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

/**
 * Pure presentational component: takes `posts` as a prop rather than
 * importing BLOG_POSTS itself, so it can be rendered both client-side
 * (Vite bundle, posts loaded via import.meta.glob) and server-side by
 * scripts/build-blog.tsx (plain Node fs, no Vite macros available there).
 */
export function BlogIndexPage({ posts }: { posts: BlogPost[] }) {
  return (
    <BlogLayout>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accentDeep">
        VryfID Mortgage Blog
      </p>
      <h1 className="mb-3 font-serif text-3xl text-ink sm:text-4xl">
        Straight answers on Israeli mortgages.
      </h1>
      <p className="mb-10 max-w-xl text-inkMuted">
        Plain-language explainers on LTV limits, loan tracks, payment-to-income, closing costs,
        and the other numbers that decide what a bank will actually offer you.
      </p>

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="group rounded-2xl border border-hairline bg-card p-5 shadow-lift transition-shadow hover:shadow-liftHover sm:p-6"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-inkMuted">
              <time dateTime={post.frontmatter.date}>{formatDate(post.frontmatter.date)}</time>
              <span aria-hidden="true">·</span>
              <span>{post.readMinutes} min read</span>
            </div>
            <h2 className="mb-1.5 text-lg font-bold text-ink group-hover:text-accentDeep sm:text-xl">
              {post.frontmatter.title}
            </h2>
            <p className="text-sm leading-relaxed text-inkMuted">{post.frontmatter.description}</p>
          </Link>
        ))}
      </div>
    </BlogLayout>
  );
}
