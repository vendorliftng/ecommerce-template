import { posts as seedPosts } from '@/data/posts';

export type PostStatus = 'published' | 'scheduled' | 'draft';

export interface GalleryImage {
  url: string;
  alt: string;
}

export interface AdminPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown
  featuredImageUrl: string;
  featuredImageAlt: string;
  gallery: GalleryImage[];
  isPublished: boolean;
  publishedAt: string | null; // ISO date
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
}

export const postStatusLabels: Record<PostStatus, string> = {
  published: 'Published',
  scheduled: 'Scheduled',
  draft: 'Draft',
};

// Published + date in the future = Scheduled
export function getPostStatus(p: Pick<AdminPost, 'isPublished' | 'publishedAt'>): PostStatus {
  if (!p.isPublished || !p.publishedAt) return 'draft';
  return new Date(p.publishedAt).getTime() > Date.now() ? 'scheduled' : 'published';
}

// ---------- Mock store (resets when you refresh) ----------
type Seed = Partial<Omit<AdminPost, 'gallery'>> & {
  slug: string;
  title: string;
  gallery?: (string | Partial<GalleryImage> & { src?: string })[];
};

// Accepts gallery as ['a.jpg'] or [{ url, alt }] or [{ src, alt }]
const toGallery = (g: Seed['gallery'], title: string): GalleryImage[] =>
  (g ?? []).map((item) =>
    typeof item === 'string'
      ? { url: item, alt: title }
      : { url: item.url ?? item.src ?? '', alt: item.alt ?? title },
  );

let store: AdminPost[] = (seedPosts as unknown as Seed[]).map((p, i) => ({
  id: p.id ?? p.slug,
  title: p.title,
  slug: p.slug,
  excerpt: p.excerpt ?? '',
  content: p.content ?? '',
  featuredImageUrl: p.featuredImageUrl ?? '',
  featuredImageAlt: p.featuredImageAlt ?? p.title,
  gallery: toGallery(p.gallery, p.title),
  isPublished: p.isPublished ?? false,
  publishedAt: p.publishedAt ?? null,
  seoTitle: p.seoTitle ?? '',
  seoDescription: p.seoDescription ?? '',
  updatedAt: p.updatedAt ?? p.publishedAt ?? new Date(Date.now() - i * 86_400_000).toISOString(),
}));

const wait = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// TODO: Firebase — getDocs(collection(db, 'posts'))
export async function fetchPosts() {
  await wait();
  return [...store].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// TODO: Firebase — query where('slug', '==', slug)
export async function getPost(slug: string) {
  await wait();
  return store.find((p) => p.slug === slug) ?? null;
}

export function isPostSlugTaken(slug: string, ignoreId?: string) {
  return store.some((p) => p.slug === slug && p.id !== ignoreId);
}

// TODO: Firebase — setDoc / updateDoc, plus upload images to Storage
export async function savePost(post: Omit<AdminPost, 'id' | 'updatedAt'> & { id?: string }) {
  await wait(600);
  const saved: AdminPost = {
    ...post,
    id: post.id ?? crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
  };
  const exists = store.some((p) => p.id === saved.id);
  store = exists ? store.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...store];
  return saved;
}

// TODO: Firebase — deleteDoc + delete images from Storage
export async function deletePost(id: string) {
  await wait(400);
  store = store.filter((p) => p.id !== id);
}