import type { APIRoute } from 'astro';
import { getPublicProducts } from '@/lib/products';
import { getPublishedPosts, POSTS_PER_PAGE } from '@/lib/posts';
import { collections } from '@/data/collections';
import { withBase } from '@/lib/url';

interface Entry {
  path: string;
  lastmod?: string;
  images?: string[];
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = ({ site }) => {
  // Full address with the sub-folder: "/products/" -> "https://vendorliftng.github.io/ecommerce-template/products/"
  const abs = (path: string) => new URL(withBase(path), site).href;

  const products = getPublicProducts();
  const posts = getPublishedPosts();
  const blogPageCount = Math.ceil(posts.length / POSTS_PER_PAGE);

  const entries: Entry[] = [
    { path: '/' },
    { path: '/products/' },
    { path: '/collections/' },
    { path: '/blog/', lastmod: posts[0]?.updatedAt },
    { path: '/contact/' },
    // One page per collection: /collections/shoes/, /collections/bags/ …
    ...collections.map((c) => ({ path: c.href, images: [c.imageUrl] })),
    // Extra blog pages: /blog/2/, /blog/3/ …
    ...Array.from({ length: Math.max(0, blogPageCount - 1) }, (_, i) => ({ path: `/blog/${i + 2}/` })),
    // Every public product, with its image
    ...products.map((p) => ({ path: `/products/${p.slug}/`, images: [p.featuredImageUrl] })),
    // Every published post, with its image and last update
    ...posts.map((p) => ({ path: `/blog/${p.slug}/`, lastmod: p.updatedAt, images: [p.featuredImageUrl] })),
  ];

  const urls = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : '';
      const images = (entry.images ?? [])
        .map((img) => `\n    <image:image><image:loc>${escapeXml(abs(img))}</image:loc></image:image>`)
        .join('');
      return `  <url>\n    <loc>${escapeXml(abs(entry.path))}</loc>${lastmod}${images}\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};