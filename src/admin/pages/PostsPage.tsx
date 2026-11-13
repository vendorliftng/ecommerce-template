import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchPosts, getPostStatus, postStatusLabels, type AdminPost, type PostStatus } from '../lib/adminPosts';

type Filter = 'all' | PostStatus;

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'draft', label: 'Draft' },
];

export const postStatusStyles: Record<PostStatus, string> = {
  published: 'bg-emerald-50 text-emerald-800',
  scheduled: 'bg-primary/10 text-primary',
  draft: 'bg-ink/10 text-ink/70',
};

const formatDay = (iso: string) =>
  new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));

export default function PostsPage() {
  const location = useLocation();
  const message = (location.state as { message?: string } | null)?.message;

  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPosts()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: posts.length, published: 0, scheduled: 0, draft: 0 };
    posts.forEach((p) => c[getPostStatus(p)]++);
    return c;
  }, [posts]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter(
      (p) => (filter === 'all' || getPostStatus(p) === filter) && (!q || p.title.toLowerCase().includes(q)),
    );
  }, [posts, filter, search]);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-5xl leading-none text-primary sm:text-6xl">Blog posts</h1>
          <p className="mt-3 text-ink/70">Only published posts show on the website.</p>
        </div>
        <Link
          to="/posts/new"
          className="self-start rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-accent hover:text-ink sm:self-auto"
        >
          + Write a post
        </Link>
      </div>

      {message && (
        <p role="status" className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          {message}
        </p>
      )}

      {/* Filters + search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                filter === f.value ? 'border-primary bg-primary text-white' : 'border-ink/15 bg-white text-ink hover:border-primary'
              }`}
            >
              {f.label} <span className={filter === f.value ? 'text-white/70' : 'text-ink/50'}>{counts[f.value]}</span>
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts"
          aria-label="Search posts"
          className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 lg:w-80"
        />
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <div className="hidden grid-cols-[96px_1fr_130px_130px] gap-4 border-b border-ink/10 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink/50 md:grid">
          <span />
          <span>Post</span>
          <span>Status</span>
          <span>Date</span>
        </div>

        {loading ? (
          <p className="px-6 py-10 text-ink/60">Loading…</p>
        ) : visible.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-semibold text-ink">No posts found</p>
            <p className="mt-1 text-sm text-ink/60">
              {posts.length === 0 ? 'Write your first post to get started.' : 'Try a different search or filter.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {visible.map((p) => {
              const status = getPostStatus(p);
              return (
                <li key={p.id}>
                  <Link
                    to={`/posts/edit?slug=${encodeURIComponent(p.slug)}`}
                    className="grid grid-cols-[96px_1fr_auto] items-center gap-4 px-6 py-4 transition hover:bg-cream/60 md:grid-cols-[96px_1fr_130px_130px]"
                  >
                    {p.featuredImageUrl ? (
                      <img src={p.featuredImageUrl} alt="" width="96" height="64" className="h-16 w-24 rounded-xl bg-cream object-cover" />
                    ) : (
                      <span className="h-16 w-24 rounded-xl bg-cream" aria-hidden="true" />
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{p.title}</p>
                      <p className="truncate text-sm text-ink/50">{p.excerpt || `/blog/${p.slug}`}</p>
                    </div>

                    <span className={`justify-self-start rounded-full px-3 py-1 text-xs font-semibold ${postStatusStyles[status]}`}>
                      {postStatusLabels[status]}
                    </span>

                    <p className="hidden text-sm text-ink/60 md:block">{p.publishedAt ? formatDay(p.publishedAt) : '—'}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}