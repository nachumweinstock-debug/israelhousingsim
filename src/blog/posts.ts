import { buildPostList, type BlogPost } from "./markdown";

const rawModules = import.meta.glob("/content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const entries = Object.entries(rawModules).map(([path, raw]) => {
  const slug = path.split("/").pop()!.replace(/\.md$/, "");
  return { slug, raw };
});

export const BLOG_POSTS: BlogPost[] = buildPostList(entries);

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export type { BlogPost };
