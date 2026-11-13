import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Lead } from '../data/MockLeads';
import { fetchLeads } from '../lib/leads';
import { products } from '@/data/products';
import { posts } from '@/data/posts';

// ---------- Helpers ----------
function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return 'Yesterday';
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short' }).format(new Date(iso));
}

const shortDate = (iso: string) =>
  new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short' }).format(new Date(iso));

type Badge = 'alert' | 'stock' | 'draft' | 'scheduled';

interface AttentionItem {
  id: string;
  title: string;
  note: string;
  badge: Badge;
  to: string;
  imageUrl?: string;
}

const badgeStyles: Record<Badge, { label: string; className: string }> = {
  alert: { label: 'Alert failed', className: 'bg-red-100 text-red-800' },
  stock: { label: 'Out of stock', className: 'bg-amber-100 text-amber-800' },
  draft: { label: 'Draft', className: 'bg-ink/10 text-ink/70' },
  scheduled: { label: 'Scheduled', className: 'bg-primary/10 text-primary' },
};

const leadStatusStyles: Record<Lead['status'], string> = {
  new: 'bg-primary/10 text-primary',
  contacted: 'bg-accent/25 text-ink',
  closed: 'bg-ink/10 text-ink/60',
};

// ---------- Page ----------
export default function OverviewPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Firebase — read the latest leads and counts from Firestore
    fetchLeads()
      .then(setLeads)
      .finally(() => setLoading(false));
  }, []);

  const now = Date.now();
  const isScheduled = (p: (typeof posts)[number]) =>
    p.isPublished && !!p.publishedAt && new Date(p.publishedAt).getTime() > now;
  const isLivePost = (p: (typeof posts)[number]) =>
    p.isPublished && !!p.publishedAt && new Date(p.publishedAt).getTime() <= now;

  const stats = useMemo(() => {
    const liveProducts = products.filter((p) => p.status !== 'draft');
    return {
      newLeads: leads.filter((l) => l.status === 'new').length,
      liveProducts: liveProducts.length,
      outOfStock: products.filter((p) => p.status === 'out_of_stock').length,
      publishedPosts: posts.filter(isLivePost).length,
      drafts: products.filter((p) => p.status === 'draft').length + posts.filter((p) => !p.isPublished).length,
    };
  }, [leads]);

  const attention = useMemo<AttentionItem[]>(() => {
    const items: AttentionItem[] = [
      ...leads
        .filter((l) => !l.notifiedAt)
        .map((l) => ({ id: `alert-${l.id}`, title: l.fullName, note: 'WhatsApp alert not sent: reply manually', badge: 'alert' as const, to: '/leads' })),
      ...products
        .filter((p) => p.status === 'out_of_stock')
        .map((p) => ({ id: `stock-${p.slug}`, title: p.title, note: 'Update when restocked', badge: 'stock' as const, to: '/products', imageUrl: p.featuredImageUrl })),
      ...products
        .filter((p) => p.status === 'draft')
        .map((p) => ({ id: `draft-${p.slug}`, title: p.title, note: 'Product not yet published', badge: 'draft' as const, to: '/products', imageUrl: p.featuredImageUrl })),
      ...posts
        .filter((p) => !p.isPublished)
        .map((p) => ({ id: `post-${p.slug}`, title: p.title, note: 'Blog post not yet published', badge: 'draft' as const, to: '/posts', imageUrl: p.featuredImageUrl })),
      ...posts
        .filter(isScheduled)
        .map((p) => ({ id: `sched-${p.slug}`, title: p.title, note: `Goes live on ${shortDate(p.publishedAt!)}`, badge: 'scheduled' as const, to: '/posts', imageUrl: p.featuredImageUrl })),
    ];
    return items.slice(0, 6);
  }, [leads]);

  const latestLeads = leads.slice(0, 5);

  const cards = [
    { label: 'New enquiries', value: stats.newLeads, note: 'Waiting for a reply', to: '/leads', highlight: true },
    { label: 'Live products', value: stats.liveProducts, note: stats.outOfStock > 0 ? `${stats.outOfStock} out of stock` : 'All in stock', to: '/products' },
    { label: 'Published posts', value: stats.publishedPosts, note: 'On the blog', to: '/posts' },
    { label: 'Drafts', value: stats.drafts, note: 'Products and posts', to: '/products' },
  ];

  return (
    <div className="space-y-8">
      {/* Heading + actions */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-5xl leading-none text-primary sm:text-6xl">{greeting()}</h1>
          <p className="mt-3 text-lg text-ink/70">Here's what's happening with your website.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/posts/new" className="rounded-xl border border-ink/15 bg-white px-5 py-3 font-semibold text-ink transition hover:border-primary hover:text-primary">
            Write a post
          </Link>
          <Link to="/products/new" className="rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-accent hover:text-ink">
            + Add product
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <li key={card.label}>
            <Link
              to={card.to}
              className={`block h-full rounded-2xl p-6 transition hover:-translate-y-0.5 hover:shadow-lg ${
                card.highlight ? 'bg-primary text-white' : 'border border-ink/10 bg-white text-ink'
              }`}
            >
              <p className="font-semibold">{card.label}</p>
              <p className="mt-2 font-display text-6xl leading-none">{loading && card.highlight ? '…' : card.value}</p>
              <p className={`mt-3 text-sm ${card.highlight ? 'text-white/75' : 'text-ink/60'}`}>{card.note}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent enquiries */}
        <section aria-labelledby="recent-heading" className="overflow-hidden rounded-2xl border border-ink/10 bg-white lg:col-span-3">
          <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
            <h2 id="recent-heading" className="text-lg font-semibold text-ink">Recent enquiries</h2>
            <Link to="/leads" className="text-sm font-semibold text-primary hover:underline">View all →</Link>
          </div>

          {loading ? (
            <p className="px-6 py-8 text-ink/60">Loading…</p>
          ) : latestLeads.length === 0 ? (
            <p className="px-6 py-8 text-ink/60">No enquiries yet.</p>
          ) : (
            <ul className="divide-y divide-ink/10">
              {latestLeads.map((lead) => (
                <li key={lead.id}>
                  <Link to="/leads" className="flex items-start gap-3 px-6 py-4 transition hover:bg-cream/60">
                    <span
                      className={`mt-2 h-2 w-2 shrink-0 rounded-full ${lead.status === 'new' ? 'bg-primary' : 'bg-transparent'}`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate font-semibold text-ink">{lead.fullName}</p>
                        <p className="shrink-0 text-sm text-ink/50">{timeAgo(lead.createdAt)}</p>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <p className="truncate text-ink/70">{lead.message}</p>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${leadStatusStyles[lead.status]}`}>
                          {lead.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Needs attention */}
        <section aria-labelledby="attention-heading" className="overflow-hidden rounded-2xl border border-ink/10 bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
            <h2 id="attention-heading" className="text-lg font-semibold text-ink">Needs attention</h2>
            {attention.length > 0 && (
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-ink">{attention.length}</span>
            )}
          </div>

          {attention.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="font-semibold text-ink">All caught up</p>
              <p className="mt-1 text-sm text-ink/60">Nothing needs your attention right now.</p>
            </div>
          ) : (
            <ul className="divide-y divide-ink/10">
              {attention.map((item) => (
                <li key={item.id}>
                  <Link to={item.to} className="flex items-center gap-4 px-6 py-4 transition hover:bg-cream/60">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" width="56" height="56" className="h-14 w-14 shrink-0 rounded-xl bg-cream object-cover" />
                    ) : (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700" aria-hidden="true">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M10.34 3.94L2.18 18a2 2 0 001.73 3h16.18a2 2 0 001.73-3L13.66 3.94a2 2 0 00-3.32 0z" />
                        </svg>
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">{item.title}</p>
                      <p className="truncate text-sm text-ink/60">{item.note}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeStyles[item.badge].className}`}>
                      {badgeStyles[item.badge].label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}