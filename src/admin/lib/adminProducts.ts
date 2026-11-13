import { products as seedProducts } from '@/data/products';

export type ProductStatus = 'active' | 'out_of_stock' | 'draft';
export type Category = 'shoes' | 'bags' | 'travel';

export interface AdminProduct {
  id: string;
  title: string;
  slug: string;
  category: Category;
  price: number; // in naira
  shortDescription: string;
  longDescription: string;
  status: ProductStatus;
  featuredImageUrl: string;
  featuredImageAlt: string;
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
}

export const categoryLabels: Record<Category, string> = {
  shoes: 'Shoes',
  bags: 'Bags',
  travel: 'Travel bags',
};

export const statusLabels: Record<ProductStatus, string> = {
  active: 'Active',
  out_of_stock: 'Out of stock',
  draft: 'Draft',
};

// Turns "The Signature Tote!" into "the-signature-tote"
export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ---------- Mock store (resets when you refresh) ----------
type Seed = Partial<AdminProduct> & { slug: string; title: string };

let store: AdminProduct[] = (seedProducts as unknown as Seed[]).map((p, i) => ({
  id: p.id ?? p.slug,
  title: p.title,
  slug: p.slug,
  category: p.category ?? 'bags',
  price: Number(p.price ?? 0),
  shortDescription: p.shortDescription ?? '',
  longDescription: p.longDescription ?? '',
  status: p.status ?? 'active',
  featuredImageUrl: p.featuredImageUrl ?? '',
  featuredImageAlt: p.featuredImageAlt ?? p.title,
  seoTitle: p.seoTitle ?? '',
  seoDescription: p.seoDescription ?? '',
  updatedAt: p.updatedAt ?? new Date(Date.now() - i * 2 * 86_400_000).toISOString(),
}));

const wait = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// TODO: Firebase — getDocs(collection(db, 'products'))
export async function fetchProducts() {
  await wait();
  return [...store].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// TODO: Firebase — query where('slug', '==', slug)
export async function getProduct(slug: string) {
  await wait();
  return store.find((p) => p.slug === slug) ?? null;
}

export function isSlugTaken(slug: string, ignoreId?: string) {
  return store.some((p) => p.slug === slug && p.id !== ignoreId);
}

// TODO: Firebase — setDoc / updateDoc, plus upload the image to Storage
export async function saveProduct(product: Omit<AdminProduct, 'id' | 'updatedAt'> & { id?: string }) {
  await wait(600);
  const saved: AdminProduct = {
    ...product,
    id: product.id ?? crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
  };
  const exists = store.some((p) => p.id === saved.id);
  store = exists ? store.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...store];
  return saved;
}

// TODO: Firebase — deleteDoc + delete the image from Storage
export async function deleteProduct(id: string) {
  await wait(400);
  store = store.filter((p) => p.id !== id);
}