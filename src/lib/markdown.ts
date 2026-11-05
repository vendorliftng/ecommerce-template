import { Marked } from 'marked';

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

const marked = new Marked({
  renderer: {
    // Inline images: lazy-load them (PRD 6.5) and keep their alt text
    image({ href, title, text }) {
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
      return `<img src="${escapeAttr(href)}" alt="${escapeAttr(text)}"${titleAttr} loading="lazy" decoding="async" />`;
    },
  },
});

/** Convert a post's Markdown content to HTML (runs at build time). */
export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}