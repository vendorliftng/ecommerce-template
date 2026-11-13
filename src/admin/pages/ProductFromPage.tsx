import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  SLUG_PATTERN,
  categoryLabels,
  deleteProduct,
  getProduct,
  isSlugTaken,
  saveProduct,
  slugify,
  type AdminProduct,
  type Category,
  type ProductStatus,
} from '../lib/adminProducts';
import { prepareImage } from '../lib/image';

type Form = Omit<AdminProduct, 'id' | 'updatedAt'>;

const emptyForm: Form = {
  title: '',
  slug: '',
  category: 'bags',
  price: 0,
  shortDescription: '',
  longDescription: '',
  status: 'draft',
  featuredImageUrl: '',
  featuredImageAlt: '',
  seoTitle: '',
  seoDescription: '',
};

const statusOptions: { value: ProductStatus; label: string; help: string }[] = [
  { value: 'active', label: 'Active', help: 'Visible on the website. Customers can enquire.' },
  { value: 'out_of_stock', label: 'Out of stock', help: 'Visible with an "Out of stock" badge.' },
  { value: 'draft', label: 'Draft', help: 'Hidden from the public website.' },
];

const SITE_HOST = new URL(import.meta.env.SITE ?? 'https://example.com').host;
const inputCls =
  'w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink outline-none transition placeholder:text-ink/40 focus:border-primary focus:ring-2 focus:ring-primary/20';

// ---------- Small building blocks ----------
function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-6">
      <h2 className="mb-5 text-lg font-semibold text-ink">{title}</h2>
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

// ---------- Page ----------
export default function ProductFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const editSlug = params.get('slug'); // null = new product

  const [original, setOriginal] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(!!editSlug);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState((location.state as { saved?: boolean } | null)?.saved ? 'saved' : '');
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Load the product when editing
  useEffect(() => {
    if (!editSlug) return;
    getProduct(editSlug).then((p) => {
      if (!p) setNotFound(true);
      else {
        setOriginal(p);
        setForm(p);
        setSlugEdited(true); // don't auto-change slug of an existing product
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

  const onImageChange = async (file?: File) => {
    if (!file) return;
    setImageBusy(true);
    setImageError('');
    try {
      const img = await prepareImage(file, form.slug);
      // TODO: Firebase — upload img.blob to Storage at products/<slug>.webp and save its URL
      update('featuredImageUrl', img.url);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Something went wrong with this image.');
    } finally {
      setImageBusy(false);
    }
  };

  // ---------- Checks ----------
  const slugTaken = !!form.slug && isSlugTaken(form.slug, original?.id);
  const slugInvalid = !!form.slug && !SLUG_PATTERN.test(form.slug);
  const slugChangedOnLive = !!original && original.status !== 'draft' && form.slug !== original.slug;

  const missing = [
    !form.title.trim() && 'Title',
    (!form.slug || slugInvalid || slugTaken) && 'Web address',
    !(form.price > 0) && 'Price',
    !form.shortDescription.trim() && 'Short description',
    !form.featuredImageUrl && 'Image',
    form.featuredImageUrl && !form.featuredImageAlt.trim() && 'Image description',
  ].filter(Boolean) as string[];

  const canSave = missing.length === 0 && !saving;

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const saved = await saveProduct({ ...form, id: original?.id });
    setSaving(false);
    setOriginal(saved);
    setForm(saved);
    setSlugEdited(true);
    setBanner('saved');
    // Keep the URL in line with the (maybe new) slug
    navigate(`/products/edit?slug=${encodeURIComponent(saved.slug)}`, { replace: true, state: { saved: true } });
  };

  const onDelete = async () => {
    if (!original) return;
    await deleteProduct(original.id);
    navigate('/products', { state: { message: `"${original.title}" was deleted. Click Publish changes to update the website.` } });
  };

  // ---------- Render ----------
  if (loading) return <p className="text-ink/60">Loading…</p>;

  if (notFound) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-10 text-center">
        <p className="font-semibold text-ink">Product not found</p>
        <Link to="/products" className="mt-3 inline-block font-semibold text-primary hover:underline">← Back to products</Link>
      </div>
    );
  }

  const seoTitlePreview = `${form.seoTitle || form.title || 'Product title'} - VendorLift`;
  const seoDescPreview = form.seoDescription || form.shortDescription || 'Add a description to show how this page appears on Google.';

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/products" className="text-sm font-semibold text-ink/60 hover:text-primary">← Products</Link>
          <h1 className="mt-2 font-display text-5xl leading-none text-primary">{original ? original.title : 'New product'}</h1>
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
              <input id="title" className={inputCls} value={form.title} onChange={(e) => onTitleChange(e.target.value)} placeholder="e.g. The Signature Tote" />
            </Field>

            <Field
              label="Web address"
              htmlFor="slug"
              help={
                slugTaken ? <span className="font-semibold text-red-700">Another product already uses this address.</span>
                : slugInvalid ? <span className="font-semibold text-red-700">Use only lowercase letters, numbers and hyphens.</span>
                : 'Made from the title automatically.'
              }
            >
              <div className="flex overflow-hidden rounded-xl border border-ink/15 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <span className="flex items-center bg-cream px-3 text-sm text-ink/60">/products/</span>
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
                  This product is live. Changing its address will break links people have already shared.
                </p>
              )}
            </Field>

            <Field label="Short description" htmlFor="short" help="Shown on product cards." count={{ value: form.shortDescription.length, max: 160 }}>
              <textarea id="short" rows={3} className={inputCls} value={form.shortDescription} onChange={(e) => update('shortDescription', e.target.value)} />
            </Field>

            <Field label="Full description" htmlFor="long" help="Shown on the product page. Leave a blank line between paragraphs.">
              <textarea id="long" rows={8} className={inputCls} value={form.longDescription} onChange={(e) => update('longDescription', e.target.value)} />
            </Field>
          </Card>

          <Card title="Price and category">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Price" htmlFor="price">
                <div className="flex overflow-hidden rounded-xl border border-ink/15 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <span className="flex items-center bg-cream px-4 font-semibold text-ink/70">₦</span>
                  <input
                    id="price"
                    inputMode="numeric"
                    className="w-full px-3 py-3 text-ink outline-none"
                    placeholder="0"
                    value={form.price ? form.price.toLocaleString('en-NG') : ''}
                    onChange={(e) => update('price', Number(e.target.value.replace(/\D/g, '')))}
                  />
                </div>
              </Field>

              <Field label="Category" htmlFor="category" help="Decides which collection it shows in.">
                <select id="category" className={inputCls} value={form.category} onChange={(e) => update('category', e.target.value as Category)}>
                  {(Object.keys(categoryLabels) as Category[]).map((c) => (
                    <option key={c} value={c}>{categoryLabels[c]}</option>
                  ))}
                </select>
              </Field>
            </div>
          </Card>

          <Card title="Search engine listing">
            {/* Google-style preview */}
            <div className="rounded-xl bg-cream/60 p-4">
              <p className="truncate text-sm text-ink/60">{SITE_HOST} › products › {form.slug || 'your-product'}</p>
              <p className="mt-1 truncate text-lg text-primary">{seoTitlePreview}</p>
              <p className="mt-1 line-clamp-2 text-sm text-ink/70">{seoDescPreview}</p>
            </div>

            <Field label="SEO title" htmlFor="seoTitle" help="Optional. Uses the product title if empty." count={{ value: form.seoTitle.length, max: 60 }}>
              <input id="seoTitle" className={inputCls} value={form.seoTitle} onChange={(e) => update('seoTitle', e.target.value)} placeholder={form.title || 'Product title'} />
            </Field>

            <Field label="SEO description" htmlFor="seoDesc" help="Optional. Uses the short description if empty." count={{ value: form.seoDescription.length, max: 160 }}>
              <textarea id="seoDesc" rows={3} className={inputCls} value={form.seoDescription} onChange={(e) => update('seoDescription', e.target.value)} />
            </Field>
          </Card>
        </div>

        {/* ---------- Right column ---------- */}
        <div className="space-y-6">
          <Card title="Status">
            <fieldset className="space-y-3">
              <legend className="sr-only">Product status</legend>
              {statusOptions.map((s) => (
                <label
                  key={s.value}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                    form.status === s.value ? 'border-primary bg-primary/5' : 'border-ink/15 hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s.value}
                    checked={form.status === s.value}
                    onChange={() => update('status', s.value)}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <span>
                    <span className="block font-semibold text-ink">{s.label}</span>
                    <span className="block text-sm text-ink/60">{s.help}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          </Card>

          <Card title="Image">
            {form.featuredImageUrl ? (
              <img src={form.featuredImageUrl} alt="" className="aspect-[3/4] w-full rounded-xl bg-cream object-cover" />
            ) : (
              <div className="flex aspect-[3/4] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink/15 bg-cream/50 p-6 text-center">
                <p className="font-semibold text-ink">No image yet</p>
                <p className="mt-1 text-sm text-ink/60">JPG, PNG or WebP. We resize it for you.</p>
              </div>
            )}

            <div className="flex gap-3">
              <label className="cursor-pointer rounded-xl border border-ink/15 px-4 py-2.5 font-semibold text-ink transition hover:border-primary hover:text-primary">
                {imageBusy ? 'Preparing…' : form.featuredImageUrl ? 'Replace image' : 'Upload image'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={imageBusy}
                  onChange={(e) => {
                    onImageChange(e.target.files?.[0]);
                    e.target.value = ''; // allow picking the same file again
                  }}
                />
              </label>
              {form.featuredImageUrl && (
                <button type="button" onClick={() => update('featuredImageUrl', '')} className="px-2 font-semibold text-red-700 hover:underline">
                  Remove
                </button>
              )}
            </div>
            {imageError && <p role="alert" className="text-sm font-semibold text-red-700">{imageError}</p>}

            <Field label="Image description" htmlFor="alt" help="Describe the photo for Google and for blind visitors.">
              <input id="alt" className={inputCls} value={form.featuredImageAlt} onChange={(e) => update('featuredImageAlt', e.target.value)} placeholder="e.g. Tan leather tote with two handles" />
            </Field>
          </Card>

          {original && (
            <section className="rounded-2xl border border-red-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-ink">Delete product</h2>
              <p className="mt-1 text-sm text-ink/60">This removes it from the website for good.</p>
              <button type="button" onClick={() => setConfirmDelete(true)} className="mt-4 rounded-xl border border-red-300 px-4 py-2.5 font-semibold text-red-700 transition hover:bg-red-50">
                Delete product
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
            <p className="mt-2 text-ink/70">This can't be undone. The product page will disappear after you publish.</p>
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