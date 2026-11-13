import { useEffect, useMemo, useState } from 'react';
import type { Lead, LeadStatus } from '../data/MockLeads';
import { fetchLeads, updateLeadStatus } from '../lib/leads';
import { downloadFile, leadsToCsv } from '../lib/csv';
import { products } from '@/data/products';

const PAGE_SIZE = 25;
type Filter = 'all' | LeadStatus;

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
];

const productTitle = (slug?: string) => products.find((p) => p.slug === slug)?.title;

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(iso));

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);

  // Load leads once when the screen opens
  useEffect(() => {
    fetchLeads()
      .then(setLeads)
      .catch(() => setError('Could not load enquiries. Please refresh the page.'))
      .finally(() => setLoading(false));
  }, []);

  // Go back to page 1 whenever the search or filter changes
  useEffect(() => setPage(1), [search, filter]);

  const counts = useMemo(
    () => ({
      all: leads.length,
      new: leads.filter((l) => l.status === 'new').length,
      contacted: leads.filter((l) => l.status === 'contacted').length,
      closed: leads.filter((l) => l.status === 'closed').length,
    }),
    [leads],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const digits = term.replace(/\D/g, '');
    return leads.filter((lead) => {
      if (filter !== 'all' && lead.status !== filter) return false;
      if (!term) return true;
      return (
        lead.fullName.toLowerCase().includes(term) ||
        (digits.length > 0 && lead.whatsappContact.replace(/\D/g, '').includes(digits))
      );
    });
  }, [leads, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageLeads = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function changeStatus(id: string, status: LeadStatus) {
    const previous = leads;
    setLeads((current) => current.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      await updateLeadStatus(id, status);
    } catch {
      setLeads(previous);
      setError('Could not save the new status. Please try again.');
    }
  }

  function exportCsv() {
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(`vendorlift-enquiries-${date}.csv`, leadsToCsv(filtered));
  }

  return (
    <div>
      {/* Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Enquiries</h1>
          <p className="mt-1 text-ink/60">Every enquiry from the website, newest first.</p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="self-start rounded-full border-2 border-primary px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white disabled:opacity-50 sm:self-auto"
        >
          Export CSV
        </button>
      </div>

      {/* Search + filters */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or WhatsApp number"
          aria-label="Search enquiries"
          className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 lg:max-w-sm"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === f.value ? 'bg-primary text-white' : 'bg-white text-ink/70 hover:text-ink'
              }`}
            >
              {f.label} <span className="opacity-70">({counts[f.value]})</span>
            </button>
          ))}
        </div>
      </div>

      {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {/* List */}
      {loading ? (
        <p className="mt-10 text-ink/60">Loading enquiries…</p>
      ) : pageLeads.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-ink/10 bg-white p-10 text-center text-ink/60">
          No enquiries match your search.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {pageLeads.map((lead) => (
            <li key={lead.id} className="rounded-2xl border border-ink/10 bg-white p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">{lead.fullName}</p>
                    {lead.status === 'new' && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">New</span>
                    )}
                    {!lead.notifiedAt && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        WhatsApp alert not sent
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-ink/80">{lead.message}</p>

                  <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink/50">
                    <span>{formatDate(lead.createdAt)}</span>
                    <span>{lead.sourceContext === 'product_inquiry' ? 'Product enquiry' : 'Contact form'}</span>
                    {productTitle(lead.productId) && <span>{productTitle(lead.productId)}</span>}
                    {lead.email && <span>{lead.email}</span>}
                  </p>
                </div>

                <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                  <a
                    href={`https://wa.me/${lead.whatsappContact.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline"
                  >
                    {lead.whatsappContact}
                  </a>
                  <label className="sr-only" htmlFor={`status-${lead.id}`}>Status for {lead.fullName}</label>
                  <select
                    id={`status-${lead.id}`}
                    value={lead.status}
                    onChange={(e) => changeStatus(lead.id, e.target.value as LeadStatus)}
                    className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            ← Previous
          </button>
          <p className="text-sm text-ink/60">Page {page} of {totalPages}</p>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
            className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}