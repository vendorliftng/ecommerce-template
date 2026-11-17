// The site's sub-folder, e.g. "/ecommerce-template" on GitHub Pages, or "" on a normal domain
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

// Adds the sub-folder in front of a path: "/images/a.webp" -> "/ecommerce-template/images/a.webp"
export function withBase(path: string) {
  if (!path) return path;
  // Leave full web addresses, emails, phone links, previews and #anchors alone
  if (/^(https?:|mailto:|tel:|data:|blob:|#)/.test(path)) return path;
  // Already has the sub-folder? Don't add it twice
  if (BASE && (path === BASE || path.startsWith(BASE + '/'))) return path;
  return BASE + (path.startsWith('/') ? path : '/' + path);
}