import type { Product } from '@/data/products';
import type { Post } from '@/data/posts';
import { site } from '@/data/site';
import { withBase } from '@/lib/url';

export interface Crumb {
  label: string;
  href?: string;
}

// Turns a path like "/products/tote/" into a full address with the sub-folder:
// "https://vendorliftng.github.io/ecommerce-template/products/tote/"
const fullUrl = (path: string, siteUrl: URL) => new URL(withBase(path), siteUrl).href;

/** BreadcrumbList structured data (PRD 6.4) */
export function breadcrumbSchema(items: Crumb[], siteUrl: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href && { item: fullUrl(item.href, siteUrl) }),
    })),
  };
}

/** Product structured data with an Offer (PRD 6.4) */
export function productSchema(product: Product, siteUrl: URL) {
  const url = fullUrl(`/products/${product.slug}/`, siteUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.seoDescription ?? product.shortDescription,
    image: [fullUrl(product.featuredImageUrl, siteUrl)],
    sku: product.slug,
    brand: { '@type': 'Brand', name: site.name },
    offers: {
      '@type': 'Offer',
      url,
      price: product.price,
      priceCurrency: product.currency,
      availability:
        product.status === 'active'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: site.name },
    },
  };
}

/** BlogPosting structured data (PRD 6.4: headline, image, datePublished, dateModified, author) */
export function blogPostingSchema(post: Post, siteUrl: URL) {
  const url = fullUrl(`/blog/${post.slug}/`, siteUrl);
  const authorName = post.authorName ?? site.name;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seoDescription ?? post.excerpt,
    image: [fullUrl(post.ogImageUrl ?? post.featuredImageUrl, siteUrl)],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': authorName === site.name ? 'Organization' : 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      logo: { '@type': 'ImageObject', url: fullUrl('/images/logo-square.png', siteUrl) },
    },
    mainEntityOfPage: url,
  };
}