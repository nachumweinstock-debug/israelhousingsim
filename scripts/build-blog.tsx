/**
 * Blog prerender step, run as `tsx scripts/build-blog.tsx` after `vite
 * build` (see the "build" script in package.json). This app is a plain
 * Vite SPA with no SSR, so without this step every /blog/* URL would only
 * ever serve the same empty <div id="root"> shell as every other route,
 * meaning crawlers and social-share scrapers see nothing and every post
 * would share one generic <title>/description. This script renders each
 * post's real markup into dist/blog/<slug>/index.html with its own head
 * tags (title, description, canonical, OG, Twitter, JSON-LD Article), so
 * that content exists at first paint. The client bundle's own <script>
 * tag is carried over unchanged, so React still boots on top and takes
 * over full SPA navigation immediately after.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// The --tsconfig flag on the tsx invocation (see package.json) makes every
// *imported* module use the automatic JSX runtime, matching tsconfig.app's
// "jsx": "react-jsx", but that setting doesn't reach back to this entry
// file's own JSX below, which still compiles under the classic transform
// and needs React in scope for React.createElement.
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { buildPostList, type BlogPost } from "../src/blog/markdown";
import { BlogIndexPage } from "../src/blog/BlogIndexPage";
import { BlogPostPage } from "../src/blog/BlogPostPage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content", "blog");
const DIST_DIR = path.join(ROOT, "dist");
const SITE_URL = "https://israelhousingsim.vercel.app";

function loadPosts(): BlogPost[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  const entries = files.map((file) => ({
    slug: file.replace(/\.md$/, ""),
    raw: fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8"),
  }));
  return buildPostList(entries);
}

function extractBodyScripts(shellHtml: string): string {
  // Every <script>/<link rel="modulepreload"> tag actually emitted by
  // Vite's build, so the prerendered page loads the exact same hashed
  // bundle as index.html and boots the real SPA on top of the static markup.
  const scripts = shellHtml.match(/<script[^>]*type="module"[^>]*><\/script>/g) ?? [];
  const preloads = shellHtml.match(/<link[^>]*rel="modulepreload"[^>]*>/g) ?? [];
  return [...preloads, ...scripts].join("\n    ");
}

function extractStyles(shellHtml: string): string {
  const styles = shellHtml.match(/<link[^>]*rel="stylesheet"[^>]*href="\/assets\/[^"]*"[^>]*>/g) ?? [];
  return styles.join("\n    ");
}

function buildHead(opts: {
  title: string;
  description: string;
  canonicalPath: string;
  jsonLd: Record<string, unknown>;
  bundleStyles: string;
}): string {
  const canonical = `${SITE_URL}${opts.canonicalPath}`;
  return `<meta charset="UTF-8" />
    <link rel="icon" type="image/jpeg" href="/vryfid-logo.jpeg" />
    <link rel="apple-touch-icon" href="/vryfid-logo.jpeg" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="canonical" href="${canonical}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="google" content="notranslate" />
    <meta name="theme-color" content="#5B9BD5" />
    <meta name="application-name" content="VryfID Mortgage Readiness Check" />
    <meta name="apple-mobile-web-app-title" content="VryfID Mortgage" />
    <meta name="robots" content="index, follow, max-image-preview:large, notranslate" />
    <meta name="googlebot" content="index, follow" />
    <title>${escapeHtml(opts.title)}</title>
    <meta name="description" content="${escapeHtml(opts.description)}" />
    <meta name="author" content="VryfID" />
    <meta name="publisher" content="VryfID" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="VryfID Mortgage" />
    <meta property="og:title" content="${escapeHtml(opts.title)}" />
    <meta property="og:description" content="${escapeHtml(opts.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${SITE_URL}/vryfid-full-logo.jpeg" />
    <meta property="og:image:alt" content="VryfID logo" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(opts.title)}" />
    <meta name="twitter:description" content="${escapeHtml(opts.description)}" />
    <meta name="twitter:image" content="${SITE_URL}/vryfid-full-logo.jpeg" />
    <script type="application/ld+json">${JSON.stringify(opts.jsonLd)}</script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Figtree:wght@300;400;500;600;700;800&family=Frank+Ruhl+Libre:wght@400;500;700&family=Heebo:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    ${opts.bundleStyles}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function writePage(relDir: string, headHtml: string, bodyInnerHtml: string, bodyScripts: string) {
  const html = `<!doctype html>
<html lang="en">
  <head>
    ${headHtml}
  </head>
  <body>
    <div id="root">${bodyInnerHtml}</div>
    ${bodyScripts}
  </body>
</html>
`;
  const outDir = path.join(DIST_DIR, relDir);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html, "utf-8");
}

function main() {
  const shellHtml = fs.readFileSync(path.join(DIST_DIR, "index.html"), "utf-8");
  const bodyScripts = extractBodyScripts(shellHtml);
  const bundleStyles = extractStyles(shellHtml);

  const posts = loadPosts();
  if (posts.length === 0) {
    console.warn("[build-blog] No posts found in content/blog — skipping blog prerender.");
    return;
  }

  const orgJsonLd = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "VryfID",
    url: "https://www.vryfid.com/",
    logo: `${SITE_URL}/vryfid-logo.jpeg`,
  };

  // Index page
  const indexMarkup = renderToStaticMarkup(
    <StaticRouter location="/blog">
      <BlogIndexPage posts={posts} />
    </StaticRouter>
  );
  writePage(
    "blog",
    buildHead({
      title: "VryfID Mortgage Blog | Israeli Mashkanta Explained",
      description:
        "Plain-language explainers on LTV limits, loan tracks, payment-to-income, and closing costs for Israeli mortgages.",
      canonicalPath: "/blog",
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          orgJsonLd,
          {
            "@type": "Blog",
            "@id": `${SITE_URL}/blog#blog`,
            name: "VryfID Mortgage Blog",
            url: `${SITE_URL}/blog`,
            publisher: { "@id": `${SITE_URL}/#organization` },
            blogPost: posts.map((p) => ({
              "@type": "BlogPosting",
              headline: p.frontmatter.title,
              url: `${SITE_URL}/blog/${p.slug}`,
              datePublished: p.frontmatter.date,
            })),
          },
        ],
      },
      bundleStyles,
    }),
    indexMarkup,
    bodyScripts
  );

  // Post pages
  for (const post of posts) {
    const markup = renderToStaticMarkup(
      <StaticRouter location={`/blog/${post.slug}`}>
        <BlogPostPage post={post} />
      </StaticRouter>
    );
    writePage(
      `blog/${post.slug}`,
      buildHead({
        title: `${post.frontmatter.title} | VryfID Mortgage Blog`,
        description: post.frontmatter.description,
        canonicalPath: `/blog/${post.slug}`,
        jsonLd: {
          "@context": "https://schema.org",
          "@graph": [
            orgJsonLd,
            {
              "@type": "BlogPosting",
              "@id": `${SITE_URL}/blog/${post.slug}#article`,
              headline: post.frontmatter.title,
              description: post.frontmatter.description,
              datePublished: post.frontmatter.date,
              dateModified: post.frontmatter.date,
              url: `${SITE_URL}/blog/${post.slug}`,
              image: `${SITE_URL}/vryfid-full-logo.jpeg`,
              inLanguage: "en",
              author: { "@id": `${SITE_URL}/#organization` },
              publisher: { "@id": `${SITE_URL}/#organization` },
              mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
            },
          ],
        },
        bundleStyles,
      }),
      markup,
      bodyScripts
    );
  }

  // Sitemap: extend the existing one (app root untouched) with /blog + every post.
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_URL}/`, priority: "1.0" },
    { loc: `${SITE_URL}/blog`, priority: "0.8" },
    ...posts.map((p) => ({ loc: `${SITE_URL}/blog/${p.slug}`, priority: "0.7" })),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  )
  .join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), sitemap, "utf-8");

  console.log(`[build-blog] Prerendered ${posts.length} post(s) + blog index + sitemap.xml`);
}

main();
