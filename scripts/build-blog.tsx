/**
 * Blog prerender step, run as `tsx scripts/build-blog.tsx` after `vite
 * build` (see the "build" script in package.json). This app is a plain
 * Vite SPA with no SSR, so without this step every /blog/* URL would only
 * ever serve the same empty <div id="root"> shell as every other route,
 * meaning crawlers and social-share scrapers see nothing and every post
 * would share one generic <title>/description. This script renders each
 * post's real markup (both English and Hebrew) into its own static HTML
 * file with its own head tags (title, description, canonical, OG,
 * Twitter, hreflang, JSON-LD BlogPosting), so that content exists at
 * first paint. The client bundle's own <script> tag is carried over
 * unchanged, so React still boots on top and takes over full SPA
 * navigation immediately after.
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
import { buildPostList, type BlogLang, type BlogPost } from "../src/blog/markdown";
import { BlogIndexPage } from "../src/blog/BlogIndexPage";
import { BlogPostPage } from "../src/blog/BlogPostPage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content", "blog");
const DIST_DIR = path.join(ROOT, "dist");
const SITE_URL = "https://israelhousingsim.vercel.app";
const LANGS: BlogLang[] = ["en", "he"];

function loadPosts(): BlogPost[] {
  const entries: Array<{ slug: string; raw: string; lang: BlogLang }> = [];
  for (const lang of LANGS) {
    const dir = path.join(CONTENT_DIR, lang);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      entries.push({
        slug: file.replace(/\.md$/, ""),
        raw: fs.readFileSync(path.join(dir, file), "utf-8"),
        lang,
      });
    }
  }
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

interface HreflangLink {
  hreflang: string;
  href: string;
}

function buildHead(opts: {
  title: string;
  description: string;
  canonicalPath: string;
  ogLocale: string;
  hreflangLinks: HreflangLink[];
  jsonLd: Record<string, unknown>;
  bundleStyles: string;
}): string {
  const canonical = `${SITE_URL}${opts.canonicalPath}`;
  const hreflangHtml = opts.hreflangLinks
    .map((l) => `<link rel="alternate" hreflang="${l.hreflang}" href="${l.href}" />`)
    .join("\n    ");
  return `<meta charset="UTF-8" />
    <link rel="icon" type="image/jpeg" href="/vryfid-logo.jpeg" />
    <link rel="apple-touch-icon" href="/vryfid-logo.jpeg" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="canonical" href="${canonical}" />
    ${hreflangHtml}
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
    <meta property="og:locale" content="${opts.ogLocale}" />
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

function writePage(
  relDir: string,
  lang: BlogLang,
  headHtml: string,
  bodyInnerHtml: string,
  bodyScripts: string
) {
  const dir = lang === "he" ? "rtl" : "ltr";
  const html = `<!doctype html>
<html lang="${lang}" dir="${dir}">
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

/** `/blog` or `/he/blog`, with `/blog/<slug>` or `/he/blog/<slug>` for a post. */
function urlPath(lang: BlogLang, slug?: string): string {
  const base = lang === "he" ? "/he/blog" : "/blog";
  return slug ? `${base}/${slug}` : base;
}

/**
 * Symmetric hreflang set for a page that exists in `lang`, with an
 * optional counterpart in the other language. Every entry in the returned
 * array, including the page's own language, must appear identically (same
 * hrefs) on both this page and its counterpart, that symmetry is what
 * hreflang requires to be honored at all rather than silently ignored.
 * x-default always resolves to the English URL when English exists (the
 * unprefixed, canonical entry point), falling back to Hebrew only if an
 * English version genuinely doesn't exist.
 */
function hreflangSet(slug: string | undefined, existsEn: boolean, existsHe: boolean): HreflangLink[] {
  const links: HreflangLink[] = [];
  if (existsEn) links.push({ hreflang: "en", href: `${SITE_URL}${urlPath("en", slug)}` });
  if (existsHe) links.push({ hreflang: "he", href: `${SITE_URL}${urlPath("he", slug)}` });
  const defaultLang: BlogLang = existsEn ? "en" : "he";
  links.push({ hreflang: "x-default", href: `${SITE_URL}${urlPath(defaultLang, slug)}` });
  return links;
}

function main() {
  const shellHtml = fs.readFileSync(path.join(DIST_DIR, "index.html"), "utf-8");
  const bodyScripts = extractBodyScripts(shellHtml);
  const bundleStyles = extractStyles(shellHtml);

  const allPosts = loadPosts();
  if (allPosts.length === 0) {
    console.warn("[build-blog] No posts found in content/blog — skipping blog prerender.");
    return;
  }
  const postsByLang: Record<BlogLang, BlogPost[]> = {
    en: allPosts.filter((p) => p.lang === "en"),
    he: allPosts.filter((p) => p.lang === "he"),
  };
  const slugsByLang: Record<BlogLang, Set<string>> = {
    en: new Set(postsByLang.en.map((p) => p.slug)),
    he: new Set(postsByLang.he.map((p) => p.slug)),
  };

  const orgJsonLd = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "VryfID",
    url: "https://www.vryfid.com/",
    logo: `${SITE_URL}/vryfid-logo.jpeg`,
  };

  const INDEX_TITLE: Record<BlogLang, string> = {
    en: "VryfID Mortgage Blog | Israeli Mashkanta Explained",
    he: "בלוג המשכנתאות של VryfID | מדריך למשכנתא בישראל",
  };
  const INDEX_DESCRIPTION: Record<BlogLang, string> = {
    en: "Plain-language explainers on LTV limits, loan tracks, payment-to-income, and closing costs for Israeli mortgages.",
    he: "הסברים בשפה פשוטה על אחוז מימון, מסלולי הלוואה, יחס החזר, ועלויות סגירת עסקה למשכנתא בישראל.",
  };
  const OG_LOCALE: Record<BlogLang, string> = { en: "en_US", he: "he_IL" };

  // Index pages (/blog and /he/blog): each links to the other, and both
  // exist here, so the hreflang set is the same fixed pair on each side.
  for (const lang of LANGS) {
    const indexMarkup = renderToStaticMarkup(
      <StaticRouter location={urlPath(lang)}>
        <BlogIndexPage posts={postsByLang[lang]} lang={lang} />
      </StaticRouter>
    );
    writePage(
      urlPath(lang).slice(1),
      lang,
      buildHead({
        title: INDEX_TITLE[lang],
        description: INDEX_DESCRIPTION[lang],
        canonicalPath: urlPath(lang),
        ogLocale: OG_LOCALE[lang],
        hreflangLinks: hreflangSet(undefined, true, true),
        jsonLd: {
          "@context": "https://schema.org",
          "@graph": [
            orgJsonLd,
            {
              "@type": "Blog",
              "@id": `${SITE_URL}${urlPath(lang)}#blog`,
              name: INDEX_TITLE[lang],
              url: `${SITE_URL}${urlPath(lang)}`,
              inLanguage: lang,
              publisher: { "@id": `${SITE_URL}/#organization` },
              blogPost: postsByLang[lang].map((p) => ({
                "@type": "BlogPosting",
                headline: p.frontmatter.title,
                url: `${SITE_URL}${urlPath(lang, p.slug)}`,
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
  }

  // Post pages: hreflang depends on whether this specific slug actually
  // has a counterpart in the other language, not just whether that
  // language exists at all.
  for (const lang of LANGS) {
    const otherLang: BlogLang = lang === "en" ? "he" : "en";
    for (const post of postsByLang[lang]) {
      const existsOther = slugsByLang[otherLang].has(post.slug);
      const links = hreflangSet(
        post.slug,
        lang === "en" ? true : existsOther,
        lang === "he" ? true : existsOther
      );
      const markup = renderToStaticMarkup(
        <StaticRouter location={urlPath(lang, post.slug)}>
          <BlogPostPage post={post} allPosts={postsByLang[lang]} hasCounterpart={existsOther} />
        </StaticRouter>
      );
      const titleSuffix = lang === "he" ? "בלוג המשכנתאות של VryfID" : "VryfID Mortgage Blog";
      writePage(
        urlPath(lang, post.slug).slice(1),
        lang,
        buildHead({
          title: `${post.frontmatter.title} | ${titleSuffix}`,
          description: post.frontmatter.description,
          canonicalPath: urlPath(lang, post.slug),
          ogLocale: OG_LOCALE[lang],
          hreflangLinks: links,
          jsonLd: {
            "@context": "https://schema.org",
            "@graph": [
              orgJsonLd,
              {
                "@type": "BlogPosting",
                "@id": `${SITE_URL}${urlPath(lang, post.slug)}#article`,
                headline: post.frontmatter.title,
                description: post.frontmatter.description,
                datePublished: post.frontmatter.date,
                dateModified: post.frontmatter.date,
                url: `${SITE_URL}${urlPath(lang, post.slug)}`,
                image: `${SITE_URL}/vryfid-full-logo.jpeg`,
                inLanguage: lang,
                author: { "@id": `${SITE_URL}/#organization` },
                publisher: { "@id": `${SITE_URL}/#organization` },
                mainEntityOfPage: `${SITE_URL}${urlPath(lang, post.slug)}`,
              },
            ],
          },
          bundleStyles,
        }),
        markup,
        bodyScripts
      );
    }
  }

  // Sitemap: extend the existing one (app root untouched) with both blog
  // indexes and every post in both languages. Also annotates each URL with
  // xhtml:link hreflang alternates, the sitemap-level equivalent of the
  // per-page <link rel="alternate"> tags, a second, redundant signal search
  // engines can use even if they don't fetch every page's own head.
  const today = new Date().toISOString().slice(0, 10);
  type SitemapUrl = { loc: string; priority: string; alternates: HreflangLink[] };
  const urls: SitemapUrl[] = [{ loc: `${SITE_URL}/`, priority: "1.0", alternates: [] }];
  for (const lang of LANGS) {
    urls.push({ loc: `${SITE_URL}${urlPath(lang)}`, priority: "0.8", alternates: hreflangSet(undefined, true, true) });
  }
  for (const lang of LANGS) {
    const otherLang: BlogLang = lang === "en" ? "he" : "en";
    for (const post of postsByLang[lang]) {
      const existsOther = slugsByLang[otherLang].has(post.slug);
      urls.push({
        loc: `${SITE_URL}${urlPath(lang, post.slug)}`,
        priority: "0.7",
        alternates: hreflangSet(post.slug, lang === "en" ? true : existsOther, lang === "he" ? true : existsOther),
      });
    }
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map((u) => {
    const alt = u.alternates
      .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`)
      .join("\n");
    return `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${u.priority}</priority>\n${alt}\n  </url>`;
  })
  .join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), sitemap, "utf-8");

  console.log(
    `[build-blog] Prerendered ${postsByLang.en.length} EN + ${postsByLang.he.length} HE post(s), 2 index pages, sitemap.xml`
  );
}

main();
