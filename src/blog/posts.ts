import { buildPostList, type BlogLang, type BlogPost } from "./markdown";

const rawModules = import.meta.glob("/content/blog/*/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const entries = Object.entries(rawModules).map(([path, raw]) => {
  const match = path.match(/\/content\/blog\/(en|he)\/([^/]+)\.md$/);
  if (!match) throw new Error(`Unexpected blog content path: ${path}`);
  const [, lang, slug] = match;
  return { slug, raw, lang: lang as BlogLang };
});

export const BLOG_POSTS: BlogPost[] = buildPostList(entries);
export const EN_POSTS: BlogPost[] = BLOG_POSTS.filter((p) => p.lang === "en");
export const HE_POSTS: BlogPost[] = BLOG_POSTS.filter((p) => p.lang === "he");

export function getPostBySlug(lang: BlogLang, slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.lang === lang && p.slug === slug);
}

/** Whether `slug` has a version in the other language, for the language switcher. */
export function hasCounterpart(lang: BlogLang, slug: string): boolean {
  const otherLang: BlogLang = lang === "en" ? "he" : "en";
  return getPostBySlug(otherLang, slug) !== undefined;
}

export type { BlogPost, BlogLang };
