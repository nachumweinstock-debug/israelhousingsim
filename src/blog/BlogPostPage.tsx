import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BlogLayout } from "./BlogLayout";
import type { BlogPost } from "./markdown";

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

/**
 * Pure presentational component, same reasoning as BlogIndexPage: takes
 * `post` as a prop so it's safe to import and render with
 * ReactDOMServer.renderToStaticMarkup from the plain-Node prerender script,
 * which has no `document` and can't run import.meta.glob. The useEffect
 * below only ever runs in a real browser mount (React never invokes
 * effects during renderToStaticMarkup), so it's safe without extra guards.
 */
export function BlogPostPage({ post }: { post: BlogPost }) {
  useEffect(() => {
    document.title = `${post.frontmatter.title} | VryfID Mortgage Blog`;
  }, [post.frontmatter.title]);

  return (
    <BlogLayout>
      <Link to="/blog" className="mb-6 inline-block text-sm font-semibold text-accentDeep hover:underline">
        ← All posts
      </Link>

      <article>
        <header className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-inkMuted">
            <time dateTime={post.frontmatter.date}>{formatDate(post.frontmatter.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readMinutes} min read</span>
          </div>
          <h1 className="mb-3 font-serif text-3xl leading-tight text-ink sm:text-4xl">
            {post.frontmatter.title}
          </h1>
          <p className="text-base text-inkMuted">{post.frontmatter.description}</p>
        </header>

        <div className="blogArticle" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>

      <div className="mt-12 rounded-2xl border border-hairline bg-card p-6 text-center shadow-lift">
        <p className="mb-3 font-serif text-xl text-ink">See where your own numbers land.</p>
        <p className="mb-4 text-sm text-inkMuted">
          Two minutes, no signup, bilingual, and it shows you the exact figures a bank will look at.
        </p>
        <Link
          to="/simulator/welcome"
          className="inline-block rounded-pill bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lift transition-colors hover:bg-accentDeep"
        >
          Try the mortgage calculator →
        </Link>
      </div>
    </BlogLayout>
  );
}
