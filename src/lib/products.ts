import { products, type Product } from '@/data/products';

export const POSTS_PER_PAGE = 9;

export interface ProductGroup {
  collection: string;
  label: string;
  products: Product[];
}

/** Products visitors are allowed to see (PRD: drafts are never public). */
export function getPublicProducts(): Product[] {
  return products.filter((p) => p.status !== 'draft');
}

/** Products to promote on the homepage: in stock only. */
export function getFeaturedProducts(limit = 4): Product[] {
  return getPublicProducts()
    .filter((p) => p.status === 'active')
    .slice(0, limit);
}

/** One public product by slug, or undefined if it doesn't exist or is a draft. */
export function getProductBySlug(slug: string): Product | undefined {
  return getPublicProducts().find((p) => p.slug === slug);
}

/** Filter public products by collection slug (case-insensitive). */
export function getProductsByCollection(collectionSlug: string): Product[] {
  const normalized = collectionSlug.trim().toLowerCase();
  return getPublicProducts().filter(
    (p) => p.collection.trim().toLowerCase() === normalized
  );
}

/** Group public products by collection in appearance order. */
export function getProductsGroupedByCollection(
  collectionLabels: Record<string, string> = {}
): ProductGroup[] {
  const groups = new Map<string, ProductGroup>();

  for (const product of getPublicProducts()) {
    const key = product.collection.trim().toLowerCase() || 'other';
    const existing = groups.get(key);

    if (existing) {
      existing.products.push(product);
    } else {
      const fallbackLabel =
        collectionLabels[key] ??
        key.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      groups.set(key, {
        collection: key,
        label: fallbackLabel,
        products: [product],
      });
    }
  }

  return Array.from(groups.values());
}