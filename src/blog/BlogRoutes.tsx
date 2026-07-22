import { Navigate, useParams } from "react-router-dom";
import { EN_POSTS, HE_POSTS, getPostBySlug, hasCounterpart } from "./posts";
import { BlogIndexPage } from "./BlogIndexPage";
import { BlogPostPage } from "./BlogPostPage";

/**
 * Client-only wiring: this is the one place that imports posts.ts (which
 * uses import.meta.glob, a Vite-only macro) and hands the resulting data
 * down to the pure presentational pages as props. Keeps BlogIndexPage /
 * BlogPostPage safe to also render from the plain-Node prerender script.
 */
export function BlogIndexRoute() {
  return <BlogIndexPage posts={EN_POSTS} lang="en" />;
}

export function BlogPostRoute() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug("en", slug) : undefined;
  if (!post) return <Navigate to="/blog" replace />;
  return <BlogPostPage post={post} allPosts={EN_POSTS} hasCounterpart={hasCounterpart("en", post.slug)} />;
}

export function HeBlogIndexRoute() {
  return <BlogIndexPage posts={HE_POSTS} lang="he" />;
}

export function HeBlogPostRoute() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug("he", slug) : undefined;
  if (!post) return <Navigate to="/he/blog" replace />;
  return <BlogPostPage post={post} allPosts={HE_POSTS} hasCounterpart={hasCounterpart("he", post.slug)} />;
}
