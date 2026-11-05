import { posts, type Post } from '@/data/posts';
export const POSTS_PER_PAGE = 9;
/** Posts visitors can see: published AND publish date in the past (PRD 5.1). Newest first. */
export function getPublishedPosts(): Post[] {
  const now = Date.now();

  return posts
    .filter((p) => p.isPublished && p.publishedAt && new Date(p.publishedAt).getTime() <= now)
    .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime());
}
/** Rough reading time in minutes (200 words per minute). */
export function readingTime(post: Post): number {
  return Math.max(1, Math.round(post.content.split(/\s+/).length / 200));
}
/** The newest few posts, for the homepage. */
export function getLatestPosts(limit = 3): Post[] {
  return getPublishedPosts().slice(0, limit);
}

/** One public post by slug, or undefined. */
export function getPostBySlug(slug: string): Post | undefined {
  return getPublishedPosts().find((p) => p.slug === slug);
}