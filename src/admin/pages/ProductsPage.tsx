import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { categoryLabels, fetchProducts, statusLabels, type AdminProduct, type ProductStatus } from '../lib/adminProducts';
import { formatPrice } from '@/lib/format';

type Filter = 'all' | ProductStatus;

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'out_of_stock', label: 'Out of stock' },
  { value: 'draft', label: 'Draft' },
];

export const statusStyles: Record<ProductStatus, string> = {
  active: 'bg-emerald-50 text-emerald-800',
  out_of_stock: 'bg-amber-100 text-amber-800',
  draft: 'bg-ink/10 text-ink/70',
};

function timeAgo(iso: string) {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return 'Yesterday';
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short' }).format(new Date(iso));
}

export default function ProductsPage() {
  const location = useLocation();
  const message = (location.state as { message?: string } | null)?.message;

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: products.length, active: 0, out_of_stock: 0, draft: 0 };
    products.forEach((p) => c[p.status]++);
    return c;
  }, [products]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) => (filter === 'all' || p.status === filter) && (!q || p.title.toLowerCase().includes(q) || p.slug.includes(q)),
    );
  }, [products, filter, search]);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-5xl leading-none text-primary sm:text-6xl">Products</h1>
          <p className="mt-3 text-ink/70">Drafts are hidden from the public website.</p>
        </div>
        <Link
          to="/products/new"
          className="self-start rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-accent hover:text-ink sm:self-auto"
        >
          + Add product
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
          placeholder="Search products"
          aria-label="Search products"
          className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 lg:w-80"
        />
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <div className="hidden grid-cols-[64px_1fr_120px_140px_100px] gap-4 border-b border-ink/10 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink/50 md:grid">
          <span />
          <span>Product</span>
          <span>Price</span>
          <span>Status</span>
          <span>Updated</span>
        </div>

        {loading ? (
          <p className="px-6 py-10 text-ink/60">Loading…</p>
        ) : visible.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-semibold text-ink">No products found</p>
            <p className="mt-1 text-sm text-ink/60">
              {products.length === 0 ? 'Add your first product to get started.' : 'Try a different search or filter.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {visible.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/products/edit?slug=${encodeURIComponent(p.slug)}`}
                  className="grid grid-cols-[64px_1fr_auto] items-center gap-4 px-6 py-4 transition hover:bg-cream/60 md:grid-cols-[64px_1fr_120px_140px_100px]"
                >
                  {p.featuredImageUrl ? (
                    <img src={p.featuredImageUrl} alt="" width="64" height="64" className="h-16 w-16 rounded-xl bg-cream object-cover" />
                  ) : (
                    <span className="h-16 w-16 rounded-xl bg-cream" aria-hidden="true" />
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{p.title}</p>
                    <p className="truncate text-sm text-ink/50">
                      {categoryLabels[p.category]} · /products/{p.slug}
                    </p>
                    {/* Price shows here on phones */}
                    <p className="mt-1 text-sm font-semibold text-ink md:hidden">{formatPrice(p.price)}</p>
                  </div>

                  <p className="hidden font-semibold text-ink md:block">{formatPrice(p.price)}</p>

                  <span className={`justify-self-start rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[p.status]}`}>
                    {statusLabels[p.status]}
                  </span>

                  <p className="hidden text-sm text-ink/60 md:block">{timeAgo(p.updatedAt)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}