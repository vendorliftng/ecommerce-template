import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { marked } from 'marked';
import {
  deletePost,
  getPost,
  getPostStatus,
  isPostSlugTaken,
  postStatusLabels,
  savePost,
  type AdminPost,
} from '../lib/adminPosts';
import { SLUG_PATTERN, slugify } from '../lib/adminProducts';
import { prepareImage } from '../lib/image';
import { postStatusStyles } from './PostsPage';

type Form = Omit<AdminPost, 'id' | 'updatedAt'>;

const emptyForm: Form = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featuredImageUrl: '',
  featuredImageAlt: '',
  gallery: [],
  isPublished: false,
  publishedAt: null,
  seoTitle: '',
  seoDescription: '',
};

const MAX_GALLERY = 6;
const SITE_HOST = new URL(import.meta.env.SITE ?? 'https://example.com').host;
const inputCls =
  'w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink outline-none transition placeholder:text-ink/40 focus:border-primary focus:ring-2 focus:ring-primary/20';

// "2026-11-10T08:00:00.000Z" <-> "2026-11-10" for the date picker
const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : '');
const fromDateInput = (day: string) => (day ? new Date(`${day}T09:00:00`).toISOString() : null);
const today = () => fromDateInput(new Date().toLocaleDateString('en-CA'));

// ---------- Small building blocks ----------
function Card({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {aside}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  help,
  count,
  children,
}: {
  label: string;
  htmlFor: string;
  help?: ReactNode;
  count?: { value: number; max: number };
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={htmlFor} className="font-semibold text-ink">{label}</label>
        {count && (
          <span className={`text-sm ${count.value > count.max ? 'font-semibold text-red-700' : 'text-ink/50'}`}>
            {count.value}/{count.max}
          </span>
        )}
      </div>
      {children}
      {help && <p className="mt-2 text-sm text-ink/60">{help}</p>}
    </div>
  );
}

// Buttons above the writing box. Each one wraps the selected text.
const toolbar: { label: string; title: string; before: string; after?: string; className?: string }[] = [
  { label: 'H', title: 'Heading', before: '\n## ', className: 'font-bold' },
  { label: 'B', title: 'Bold', before: '**', after: '**', className: 'font-bold' },
  { label: 'I', title: 'Italic', before: '_', after: '_', className: 'italic' },
  { label: '• List', title: 'Bullet list', before: '\n- ' },
  { label: 'Link', title: 'Link', before: '[', after: '](https://)' },
  { label: '❝ Quote', title: 'Quote', before: '\n> ' },
];

// ---------- Page ----------
export default function PostFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const editSlug = params.get('slug'); // null = new post
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [original, setOriginal] = useState<AdminPost | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(!!editSlug);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState((location.state as { saved?: boolean } | null)?.saved ? 'saved' : '');
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [imageBusy, setImageBusy] = useState<'' | 'cover' | 'gallery'>('');
  const [imageError, setImageError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!editSlug) return;
    getPost(editSlug).then((p) => {
      if (!p) setNotFound(true);
      else {
        setOriginal(p);
        setForm(p);
        setSlugEdited(true);
      }
      setLoading(false);
    });
  }, [editSlug]);

  const update = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setBanner('');
  };

  const onTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: slugEdited ? f.slug : slugify(title) }));
    setBanner('');
  };

  // Wrap the selected text with Markdown, e.g. **bold**
  const insert = (before: string, after = '') => {
    const el = contentRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value } = el;
    const selected = value.slice(start, end) || 'text';
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    update('content', next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const onCoverChange = async (file?: File) => {
    if (!file) return;
    setImageBusy('cover');
    setImageError('');
    try {
      const img = await prepareImage(file, form.slug);
      // TODO: Firebase — upload img.blob to Storage at posts/<slug>.webp
      update('featuredImageUrl', img.url);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Something went wrong with this image.');
    } finally {
      setImageBusy('');
    }
  };

  const onGalleryAdd = async (files: FileList | null) => {
    if (!files?.length) return;
    setImageBusy('gallery');
    setImageError('');
    try {
      const room = MAX_GALLERY - form.gallery.length;
      const picked = Array.from(files).slice(0, room);
      const added = [];
      for (const [i, file] of picked.entries()) {
        const img = await prepareImage(file, `${form.slug}-${form.gallery.length + i + 1}`);
        // TODO: Firebase — upload img.blob to Storage at posts/<slug>-<n>.webp
        added.push({ url: img.url, alt: '' });
      }
      update('gallery', [...form.gallery, ...added]);
      if (files.length > room) setImageError(`Only ${MAX_GALLERY} gallery photos allowed. Extra photos were skipped.`);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Something went wrong with this image.');
    } finally {
      setImageBusy('');
    }
  };

  const updateGalleryAlt = (index: number, alt: string) =>
    update('gallery', form.gallery.map((g, i) => (i === index ? { ...g, alt } : g)));

  const removeGalleryImage = (index: number) =>
    update('gallery', form.gallery.filter((_, i) => i !== index));

  // ---------- Checks ----------
  const status = getPostStatus(form);
  const slugTaken = !!form.slug && isPostSlugTaken(form.slug, original?.id);
  const slugInvalid = !!form.slug && !SLUG_PATTERN.test(form.slug);
  const slugChangedOnLive = !!original && getPostStatus(original) === 'published' && form.slug !== original.slug;

  const missing = [
    !form.title.trim() && 'Title',
    (!form.slug || slugInvalid || slugTaken) && 'Web address',
    !form.excerpt.trim() && 'Excerpt',
    !form.content.trim() && 'Post content',
    !form.featuredImageUrl && 'Cover image',
    form.featuredImageUrl && !form.featuredImageAlt.trim() && 'Cover image description',
    form.gallery.some((g) => !g.alt.trim()) && 'Gallery descriptions',
    form.isPublished && !form.publishedAt && 'Publish date',
  ].filter(Boolean) as string[];

  const canSave = missing.length === 0 && !saving;

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const saved = await savePost({ ...form, id: original?.id });
    setSaving(false);
    setOriginal(saved);
    setForm(saved);
    setSlugEdited(true);
    setBanner('saved');
    navigate(`/posts/edit?slug=${encodeURIComponent(saved.slug)}`, { replace: true, state: { saved: true } });
  };

  const onDelete = async () => {
    if (!original) return;
    await deletePost(original.id);
    navigate('/posts', { state: { message: `"${original.title}" was deleted. Click Publish changes to update the website.` } });
  };

  // ---------- Render ----------
  if (loading) return <p className="text-ink/60">Loading…</p>;

  if (notFound) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-10 text-center">
        <p className="font-semibold text-ink">Post not found</p>
        <Link to="/posts" className="mt-3 inline-block font-semibold text-primary hover:underline">← Back to blog posts</Link>
      </div>
    );
  }

  const seoTitlePreview = `${form.seoTitle || form.title || 'Post title'} - VendorLift`;
  const seoDescPreview = form.seoDescription || form.excerpt || 'Add a description to show how this page appears on Google.';

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/posts" className="text-sm font-semibold text-ink/60 hover:text-primary">← Blog posts</Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-5xl leading-none text-primary">{original ? original.title : 'New post'}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${postStatusStyles[status]}`}>{postStatusLabels[status]}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="hidden rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary disabled:hover:text-white sm:block"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {banner === 'saved' && (
        <p role="status" className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          <strong>Saved.</strong> Click <strong>Publish changes</strong> at the top to update the website.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ---------- Left column ---------- */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Details">
            <Field label="Title" htmlFor="title">
              <input id="title" className={inputCls} value={form.title} onChange={(e) => onTitleChange(e.target.value)} placeholder="e.g. How to care for your leather bag" />
            </Field>

            <Field
              label="Web address"
              htmlFor="slug"
              help={
                slugTaken ? <span className="font-semibold text-red-700">Another post already uses this address.</span>
                : slugInvalid ? <span className="font-semibold text-red-700">Use only lowercase letters, numbers and hyphens.</span>
                : 'Made from the title automatically.'
              }
            >
              <div className="flex overflow-hidden rounded-xl border border-ink/15 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <span className="flex items-center bg-cream px-3 text-sm text-ink/60">/blog/</span>
                <input
                  id="slug"
                  className="w-full px-3 py-3 text-ink outline-none"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    update('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }}
                />
              </div>
              {slugChangedOnLive && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  This post is live. Changing its address will break links people have already shared.
                </p>
              )}
            </Field>

            <Field label="Excerpt" htmlFor="excerpt" help="A short summary shown on blog cards." count={{ value: form.excerpt.length, max: 160 }}>
              <textarea id="excerpt" rows={3} className={inputCls} value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} />
            </Field>
          </Card>

          {/* Write / Preview */}
          <Card
            title="Post"
            aside={
              <div className="flex rounded-xl bg-cream p-1" role="tablist" aria-label="Write or preview">
                {(['write', 'preview'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={tab === t}
                    onClick={() => setTab(t)}
                    className={`rounded-lg px-4 py-1.5 text-sm font-semibold capitalize transition ${tab === t ? 'bg-white text-primary shadow-sm' : 'text-ink/60'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            }
          >
            {tab === 'write' ? (
              <div>
                <div className="flex flex-wrap gap-1 rounded-t-xl border border-b-0 border-ink/15 bg-cream/60 p-2">
                  {toolbar.map((b) => (
                    <button
                      key={b.title}
                      type="button"
                      title={b.title}
                      onClick={() => insert(b.before, b.after)}
                      className={`rounded-lg px-3 py-1.5 text-sm text-ink transition hover:bg-white ${b.className ?? ''}`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
                <label htmlFor="content" className="sr-only">Post content</label>
                <textarea
                  id="content"
                  ref={contentRef}
                  rows={18}
                  className={`${inputCls} rounded-t-none font-mono text-sm leading-relaxed`}
                  value={form.content}
                  onChange={(e) => update('content', e.target.value)}
                  placeholder={'Start writing here…\n\nLeave a blank line between paragraphs.'}
                />
                <p className="mt-2 text-sm text-ink/60">Select some text, then click a button above to style it.</p>
              </div>
            ) : form.content.trim() ? (
              <div
                className="prose max-w-none prose-headings:text-ink prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: marked.parse(form.content, { async: false }) }}
              />
            ) : (
              <p className="py-10 text-center text-ink/60">Nothing to preview yet.</p>
            )}
          </Card>

          <Card title="Search engine listing">
            <div className="rounded-xl bg-cream/60 p-4">
              <p className="truncate text-sm text-ink/60">{SITE_HOST} › blog › {form.slug || 'your-post'}</p>
              <p className="mt-1 truncate text-lg text-primary">{seoTitlePreview}</p>
              <p className="mt-1 line-clamp-2 text-sm text-ink/70">{seoDescPreview}</p>
            </div>

            <Field label="SEO title" htmlFor="seoTitle" help="Optional. Uses the post title if empty." count={{ value: form.seoTitle.length, max: 60 }}>
              <input id="seoTitle" className={inputCls} value={form.seoTitle} onChange={(e) => update('seoTitle', e.target.value)} placeholder={form.title || 'Post title'} />
            </Field>

            <Field label="SEO description" htmlFor="seoDesc" help="Optional. Uses the excerpt if empty." count={{ value: form.seoDescription.length, max: 160 }}>
              <textarea id="seoDesc" rows={3} className={inputCls} value={form.seoDescription} onChange={(e) => update('seoDescription', e.target.value)} />
            </Field>
          </Card>
        </div>

        {/* ---------- Right column ---------- */}
        <div className="space-y-6">
          <Card title="Publishing">
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <span>
                <span className="block font-semibold text-ink">Published</span>
                <span className="block text-sm text-ink/60">{form.isPublished ? 'Will show on the website.' : 'Draft: hidden from the website.'}</span>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={form.isPublished}
                onChange={(e) => {
                  update('isPublished', e.target.checked);
                  if (e.target.checked && !form.publishedAt) update('publishedAt', today());
                }}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="relative h-7 w-12 shrink-0 rounded-full bg-ink/20 transition after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:bg-primary peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40"
              />
            </label>

            <Field
              label="Publish date"
              htmlFor="date"
              help={status === 'scheduled' ? 'This date is in the future, so the post is scheduled.' : 'Pick a future date to schedule the post.'}
            >
              <input id="date" type="date" className={inputCls} value={toDateInput(form.publishedAt)} onChange={(e) => update('publishedAt', fromDateInput(e.target.value))} />
            </Field>
          </Card>

          <Card title="Cover image">
            {form.featuredImageUrl ? (
              <img src={form.featuredImageUrl} alt="" className="aspect-[16/10] w-full rounded-xl bg-cream object-cover" />
            ) : (
              <div className="flex aspect-[16/10] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink/15 bg-cream/50 p-6 text-center">
                <p className="font-semibold text-ink">No image yet</p>
                <p className="mt-1 text-sm text-ink/60">JPG, PNG or WebP. We resize it for you.</p>
              </div>
            )}

            <div className="flex gap-3">
              <label className="cursor-pointer rounded-xl border border-ink/15 px-4 py-2.5 font-semibold text-ink transition hover:border-primary hover:text-primary">
                {imageBusy === 'cover' ? 'Preparing…' : form.featuredImageUrl ? 'Replace image' : 'Upload image'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={!!imageBusy}
                  onChange={(e) => {
                    onCoverChange(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </label>
              {form.featuredImageUrl && (
                <button type="button" onClick={() => update('featuredImageUrl', '')} className="px-2 font-semibold text-red-700 hover:underline">
                  Remove
                </button>
              )}
            </div>

            <Field label="Image description" htmlFor="alt" help="Describe the photo for Google and for blind visitors.">
              <input id="alt" className={inputCls} value={form.featuredImageAlt} onChange={(e) => update('featuredImageAlt', e.target.value)} placeholder="e.g. Brown leather bag on a wooden table" />
            </Field>
          </Card>

          <Card title="Gallery" aside={<span className="text-sm text-ink/50">{form.gallery.length}/{MAX_GALLERY}</span>}>
            <p className="-mt-2 text-sm text-ink/60">Optional photos shown under the cover image.</p>

            {form.gallery.length > 0 && (
              <ul className="space-y-4">
                {form.gallery.map((g, i) => (
                  <li key={g.url} className="flex gap-3">
                    <img src={g.url} alt="" className="h-16 w-16 shrink-0 rounded-xl bg-cream object-cover" />
                    <div className="min-w-0 flex-1">
                      <label htmlFor={`g-alt-${i}`} className="sr-only">Description for photo {i + 1}</label>
                      <input
                        id={`g-alt-${i}`}
                        className={`${inputCls} py-2 text-sm`}
                        value={g.alt}
                        onChange={(e) => updateGalleryAlt(i, e.target.value)}
                        placeholder="Describe this photo"
                      />
                      <button type="button" onClick={() => removeGalleryImage(i)} className="mt-1 text-sm font-semibold text-red-700 hover:underline">
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {form.gallery.length < MAX_GALLERY && (
              <label className="inline-block cursor-pointer rounded-xl border border-ink/15 px-4 py-2.5 font-semibold text-ink transition hover:border-primary hover:text-primary">
                {imageBusy === 'gallery' ? 'Preparing…' : '+ Add photos'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  disabled={!!imageBusy}
                  onChange={(e) => {
                    onGalleryAdd(e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>
            )}
          </Card>

          {imageError && <p role="alert" className="text-sm font-semibold text-red-700">{imageError}</p>}

          {original && (
            <section className="rounded-2xl border border-red-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-ink">Delete post</h2>
              <p className="mt-1 text-sm text-ink/60">This removes it from the blog for good.</p>
              <button type="button" onClick={() => setConfirmDelete(true)} className="mt-4 rounded-xl border border-red-300 px-4 py-2.5 font-semibold text-red-700 transition hover:bg-red-50">
                Delete post
              </button>
            </section>
          )}
        </div>
      </div>

      {/* Bottom save bar */}
      <div className="sticky bottom-4 z-20 rounded-2xl border border-ink/10 bg-white/95 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between gap-4 px-5 py-3">
          <p className="truncate text-sm text-ink/60">
            {missing.length > 0 ? <>Still needed: <strong className="text-ink">{missing.join(', ')}</strong></> : 'Ready to save.'}
          </p>
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className="shrink-0 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary disabled:hover:text-white"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && original && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="delete-title" className="text-xl font-semibold text-ink">Delete "{original.title}"?</h2>
            <p className="mt-2 text-ink/70">This can't be undone. The post will disappear from the blog after you publish.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-xl border border-ink/15 px-4 py-2.5 font-semibold text-ink hover:border-ink/40" autoFocus>
                Cancel
              </button>
              <button type="button" onClick={onDelete} className="rounded-xl bg-red-700 px-4 py-2.5 font-semibold text-white hover:bg-red-800">
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}