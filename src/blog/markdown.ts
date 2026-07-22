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

export interface BlogPost {
  slug: string;
  frontmatter: BlogFrontmatter;
  html: string;
  readMinutes: number;
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

export function buildPostList(entries: Array<{ slug: string; raw: string }>): BlogPost[] {
  const posts = entries.map(({ slug, raw }) => {
    const { data, body } = parseFrontmatter(raw);
    const wordCount = body.split(/\s+/).filter(Boolean).length;
    return {
      slug,
      frontmatter: {
        title: data.title ?? slug,
        description: data.description ?? "",
        date: data.date ?? "2026-01-01",
        tags: (data.tags ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      },
      html: marked.parse(body, { async: false }) as string,
      readMinutes: Math.max(1, Math.round(wordCount / 200)),
    };
  });
  return posts.sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
}
