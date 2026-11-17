import type { APIRoute } from 'astro';
import { withBase } from '@/lib/url';

export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL(withBase('/sitemap.xml'), site).href;
  const adminPath = withBase('/admin/');

  const body = `User-agent: *
Allow: /
Disallow: ${adminPath}

Sitemap: ${sitemapUrl}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};