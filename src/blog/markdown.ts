/**
 * Framework-agnostic content pipeline shared by the Vite client bundle
 * (src/blog/posts.ts, via import.meta.glob) and the Node prerender script
 * (scripts/build-blog.tsx, via fs). Keeping the parsing/rendering logic
 * here, decoupled from how the raw markdown text is loaded, means both
 * sides produce byte-identical BlogPost objects from the same source
 * files, so the prerendered HTML and the client-hydrated page never drift.
 */
import { marked } from "marked";

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string;
  tags: string[];
}

export interface TocEntry {
  id: string;
  text: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export type BlogLang = "en" | "he";

export interface BlogPost {
  slug: string;
  lang: BlogLang;
  frontmatter: BlogFrontmatter;
  html: string;
  readMinutes: number;
  toc: TocEntry[];
  faq: FaqEntry[];
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  quot: '"',
  lt: "<",
  gt: ">",
  apos: "'",
};

/**
 * marked escapes heading text (' becomes &#39; or &#x27; depending on
 * context, & becomes &amp;, etc.); undo that for plain-text uses (TOC
 * labels, slugs), covering decimal, hex, and the handful of named
 * entities marked actually emits, rather than hardcoding one encoding.
 */
function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, code: string) => {
    if (code[0] === "#") {
      const isHex = code[1] === "x" || code[1] === "X";
      const codePoint = parseInt(isHex ? code.slice(2) : code.slice(1), isHex ? 16 : 10);
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
    }
    return NAMED_ENTITIES[code] ?? match;
  });
}

/**
 * `\w` in a non-unicode JS regex only matches ASCII, so Hebrew headings
 * slugify down to an empty string. Rather than reach for a Unicode-aware
 * transliteration (fragile, and a Hebrew string in a URL fragment just
 * gets percent-encoded and still works, but looks unreadable in the
 * address bar), an empty slugify result falls back to a plain positional
 * id (section-1, section-2, ...) in injectHeadingIds below, which is
 * stable and readable for either language.
 */
function slugify(text: string): string {
  return decodeEntities(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Injects id="..." onto every <h2> so the table of contents can link to
 * it, and collects the same {id, text} pairs for that TOC. Post-processes
 * marked's HTML output with a regex rather than a custom marked renderer,
 * since the renderer's token-based API has changed across marked major
 * versions and every heading here is plain text we control (no inline
 * markdown/HTML inside a heading), so a regex is the more stable choice.
 */
function injectHeadingIds(html: string): { html: string; toc: TocEntry[] } {
  const toc: TocEntry[] = [];
  const seen = new Set<string>();
  let position = 0;
  const withIds = html.replace(/<h2>(.*?)<\/h2>/g, (_match, inner: string) => {
    position += 1;
    const text = decodeEntities(inner.replace(/<[^>]+>/g, ""));
    const base = slugify(text) || `section-${position}`;
    let id = base;
    let suffix = 2;
    while (seen.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }
    seen.add(id);
    toc.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: withIds, toc };
}

const FAQ_HEADING_TEXT = new Set(["frequently asked questions", "שאלות נפוצות"]);

/**
 * Every post ends its body with a "## Frequently asked questions" /
 * "## שאלות נפוצות" section, each question an <h3> followed by a short
 * answer paragraph. Extracted here for FAQPage JSON-LD (see
 * scripts/build-blog.tsx), reading the same rendered HTML the article
 * already displays rather than a separate content source, so the visible
 * FAQ and the structured data can never drift out of sync. The section
 * stays in the normal article flow, this doesn't remove or hide it.
 */
function extractFaq(html: string): FaqEntry[] {
  const h2s = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)];
  const faqIndex = h2s.findIndex((m) =>
    FAQ_HEADING_TEXT.has(decodeEntities(m[1].replace(/<[^>]+>/g, "")).trim().toLowerCase())
  );
  if (faqIndex === -1) return [];
  const sectionStart = h2s[faqIndex].index! + h2s[faqIndex][0].length;
  const sectionEnd = h2s[faqIndex + 1]?.index ?? html.length;
  const section = html.slice(sectionStart, sectionEnd);

  const faqs: FaqEntry[] = [];
  const h3Matches = [...section.matchAll(/<h3[^>]*>(.*?)<\/h3>([\s\S]*?)(?=<h3|$)/g)];
  for (const m of h3Matches) {
    const question = decodeEntities(m[1].replace(/<[^>]+>/g, "")).trim();
    const answer = decodeEntities(m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).trim();
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const [, fmBlock, body] = match;
  const data: Record<string, string> = {};
  for (const line of fmBlock.split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return { data, body: body.trim() };
}

export function buildPostList(
  entries: Array<{ slug: string; raw: string; lang: BlogLang }>
): BlogPost[] {
  const posts = entries.map(({ slug, raw, lang }) => {
    const { data, body } = parseFrontmatter(raw);
    // Hebrew word counts run shorter than English for the same reading time
    // (no articles, denser morphology), but there's no reliable formula
    // without a real corpus to calibrate against, so both languages use the
    // same words-per-minute constant. Close enough for a rough estimate,
    // and it keeps the two versions of a post from showing suspiciously
    // different reading times for near-identical content.
    const wordCount = body.split(/\s+/).filter(Boolean).length;
    const rawHtml = marked.parse(body, { async: false }) as string;
    const { html, toc } = injectHeadingIds(rawHtml);
    const faq = extractFaq(html);
    return {
      slug,
      lang,
      frontmatter: {
        title: data.title ?? slug,
        description: data.description ?? "",
        date: data.date ?? "2026-01-01",
        tags: (data.tags ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      },
      html,
      readMinutes: Math.max(1, Math.round(wordCount / 200)),
      toc,
      faq,
    };
  });
  return posts.sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
}

/**
 * 2-3 posts sharing the most tags with `post`, ties broken by newest first.
 * Falls back to the newest other posts if nothing shares a tag, so the
 * section is never empty. Only ever matches within the same language, a
 * Hebrew post should never surface an English "related" link.
 */
export function relatedPosts(post: BlogPost, all: BlogPost[], max = 3): BlogPost[] {
  const others = all.filter((p) => p.slug !== post.slug && p.lang === post.lang);
  const scored = others.map((p) => {
    const shared = p.frontmatter.tags.filter((t) => post.frontmatter.tags.includes(t)).length;
    return { post: p, shared };
  });
  scored.sort((a, b) => {
    if (b.shared !== a.shared) return b.shared - a.shared;
    return a.post.frontmatter.date < b.post.frontmatter.date ? 1 : -1;
  });
  return scored.slice(0, max).map((s) => s.post);
}
