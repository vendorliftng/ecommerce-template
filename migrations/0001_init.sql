-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  collection TEXT NOT NULL,
  featured_image_url TEXT NOT NULL,
  featured_image_alt TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT,
  price INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'out_of_stock' | 'draft'
  is_featured INTEGER NOT NULL DEFAULT 0, -- 1 = featured, 0 = normal
  seo_title TEXT,
  seo_description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Blog Posts Table
CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  featured_image_url TEXT NOT NULL,
  featured_image_alt TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published', -- 'published' | 'draft'
  seo_title TEXT,
  seo_description TEXT,
  published_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. Enquiries / Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  fullname TEXT NOT NULL,
  whatsapp_contact TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  product_slug TEXT,
  status TEXT NOT NULL DEFAULT 'new', -- 'new' | 'replied' | 'closed'
  alert_status TEXT NOT NULL DEFAULT 'pending', -- 'sent' | 'failed' | 'pending'
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. Storefront Dynamic Content (Ordering Steps, Production Process, etc.)
CREATE TABLE IF NOT EXISTS site_sections (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);