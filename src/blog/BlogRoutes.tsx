import { Navigate, useParams } from "react-router-dom";
import { BLOG_POSTS, getPostBySlug } from "./posts";
import { BlogIndexPage } from "./BlogIndexPage";
import { BlogPostPage } from "./BlogPostPage";

/**
 * Client-only wiring: this is the one place that imports posts.ts (which
 * uses import.meta.glob, a Vite-only macro) and hands the resulting data
 * down to the pure presentational pages as props. Keeps BlogIndexPage /
 * BlogPostPage safe to also render from the plain-Node prerender script.
 */
export function BlogIndexRoute() {
  return <BlogIndexPage posts={BLOG_POSTS} />;
}

export function BlogPostRoute() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;
  if (!post) return <Navigate to="/blog" replace />;
  return <BlogPostPage post={post} />;
}
