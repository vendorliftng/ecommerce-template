import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth';
import { fetchLeads } from '../lib/leads';
import { site } from '@/data/site';
import { withBase } from '@/lib/url';

const links = [
  { to: '/', label: 'Overview', end: true },
  { to: '/products', label: 'Products' },
  { to: '/posts', label: 'Blog posts' },
  { to: '/leads', label: 'Enquiries', showNewCount: true },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastPublished, setLastPublished] = useState<Date | null>(null);
  const [newLeads, setNewLeads] = useState(0);

  // Count new enquiries for the sidebar badge
  useEffect(() => {
    // TODO: Firebase — count leads where status == 'new'
    fetchLeads()
      .then((leads) => setNewLeads(leads.filter((lead) => lead.status === 'new').length))
      .catch(() => setNewLeads(0));
  }, []);

  async function handlePublish() {
    setPublishing(true);
    // TODO: Firebase — call the Cloud Function that triggers the Cloudflare deploy hook (PRD 8)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLastPublished(new Date());
    setPublishing(false);
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition ${
      isActive ? 'bg-white/10 text-white' : 'text-white/75 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className="min-h-svh lg:flex">
      {/* Sidebar */}
      <aside
        className={`${menuOpen ? 'flex' : 'hidden'} flex-col bg-primary text-white lg:sticky lg:top-0 lg:flex lg:h-svh lg:w-72 lg:shrink-0`}
      >
        {/* Brand */}
        <div className="hidden px-6 pb-6 pt-8 lg:block">
          <p className="text-2xl font-extrabold tracking-tight">{site.name}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.3em] text-accent">Admin</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-4 lg:py-2" aria-label="Dashboard">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass} onClick={() => setMenuOpen(false)}>
              {({ isActive }) => (
                <>
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${isActive ? 'bg-accent' : 'bg-white/35'}`}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{link.label}</span>
                  {link.showNewCount && newLeads > 0 && (
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-2 text-xs font-bold text-ink">
                      {newLeads}
                      <span className="sr-only"> new</span>
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/15 px-4 py-4">
          <a
           href={withBase('/')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl px-4 py-3 font-semibold text-white/75 transition hover:bg-white/5 hover:text-white"
          >
            View website <span aria-hidden="true">↗</span>
          </a>
          <button
            type="button"
            onClick={signOut}
            className="w-full rounded-xl px-4 py-3 text-left font-semibold text-white/75 transition hover:bg-white/5 hover:text-white"
          >
            Log out
          </button>
          <p className="truncate px-4 pt-2 text-xs text-white/50">{user?.email}</p>
        </div>
      </aside>

      {/* Main area */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-ink/10 bg-white px-4 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="rounded-lg p-2 text-ink hover:bg-cream lg:hidden"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <p className="font-extrabold text-primary lg:hidden">{site.name}</p>
            <p className="hidden text-sm text-ink/50 lg:block">
              {lastPublished ? `Last published at ${lastPublished.toLocaleTimeString()}` : 'Saved changes go live when you publish'}
            </p>
          </div>

          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {publishing ? 'Publishing…' : 'Publish changes'}
          </button>
        </header>

        <main className="p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}