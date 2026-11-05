import { products, type Product } from '@/data/products';

export const POSTS_PER_PAGE = 9;
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