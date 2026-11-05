import type { Product } from '@/data/products';
import type { Post } from '@/data/posts';
import { site } from '@/data/site';

export interface Crumb {
  label: string;
  href?: string;
}

/** BreadcrumbList structured data (PRD 6.4) */
export function breadcrumbSchema(items: Crumb[], siteUrl: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href && { item: new URL(item.href, siteUrl).href }),
    })),
  };
}

/** Product structured data with an Offer (PRD 6.4) */
export function productSchema(product: Product, siteUrl: URL) {
  const url = new URL(`/products/${product.slug}/`, siteUrl).href;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.seoDescription ?? product.shortDescription,
    image: [new URL(product.featuredImageUrl, siteUrl).href],
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
  const url = new URL(`/blog/${post.slug}/`, siteUrl).href;
  const authorName = post.authorName ?? site.name;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seoDescription ?? post.excerpt,
    image: [new URL(post.ogImageUrl ?? post.featuredImageUrl, siteUrl).href],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': authorName === site.name ? 'Organization' : 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      logo: { '@type': 'ImageObject', url: new URL('/images/logo-square.png', siteUrl).href },
    },
    mainEntityOfPage: url,
  };
}