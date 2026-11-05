export interface Post {
  slug: string;
  title: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
  gallery?: { url: string; alt: string; caption?: string; href?: string }[]; // not in PRD: needs a Firestore field
  excerpt: string;
  content: string;           // Markdown
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  authorName?: string;
  isPublished: boolean;
  publishedAt?: string;      // ISO date: the post goes live once this date has passed
  createdAt: string;
  updatedAt: string;
}

// TODO: blog images reuse product photos; replace with real blog images
export const posts: Post[] = [
  {
    slug: 'how-to-care-for-leather-shoes',
    title: 'How to Care for Leather Shoes',
    featuredImageUrl: '/images/brown-leather-oxford-shoes.webp',
    featuredImageAlt: 'Pair of dark brown leather oxford shoes',
    gallery: [
      { url: '/images/brown-leather-oxford-shoes.webp', alt: 'Dark brown leather oxford shoes', caption: 'Oxfords', href: '/products/lagos-classic-oxfords/' },
      { url: '/images/brown-suede-loafers.webp', alt: 'Brown suede penny loafers', caption: 'Loafers', href: '/products/kano-suede-loafers/' },
      { url: '/images/enugu-chelsea-boots.webp', alt: 'Dark brown leather chelsea boots', caption: 'Chelsea boots', href: '/products/enugu-chelsea-boots/' },
    ],
    excerpt: 'A simple 10-minute weekly routine to keep your shoes looking new.',
    content: `## Clean them after wearing

Wipe off dust with a soft, dry cloth before you put your shoes away. Dirt left on leather slowly dries it out.

## Condition once a month

Leather is skin, so it needs moisture. Rub a small amount of leather conditioner in with a cloth, then let it dry overnight.

## Store them properly

- Use shoe trees to keep their shape
- Keep them out of direct sunlight
- Give each pair a day of rest between wears

Have a question about caring for your VendorLift shoes? [Send us a message](/contact/).`,
    authorName: 'VendorLift',
    isPublished: true,
    publishedAt: '2026-10-15T09:00:00Z',
    createdAt: '2026-10-14T10:00:00Z',
    updatedAt: '2026-10-15T09:00:00Z',
    seoTitle: 'How to Care for Leather Shoes',
    seoDescription: 'A simple weekly routine to clean, condition and store leather shoes so they stay polished and comfortable for years.',
  },
  {
    slug: 'choosing-a-leather-bag-for-work',
    title: 'Choosing a Leather Bag for Work',
    featuredImageUrl: '/images/tan-leather-tote-bag.webp',
    featuredImageAlt: 'Tan leather tote bag',
    gallery: [
      { url: '/images/tan-leather-tote-bag.webp', alt: 'Tan leather tote bag', caption: 'The tote', href: '/products/sokoto-heritage-tote/' },
      { url: '/images/kaduna-leather-briefcase.webp', alt: 'Structured brown leather briefcase', caption: 'The briefcase', href: '/products/kaduna-leather-briefcase/' },
      { url: '/images/brown-leather-weekender-bag.webp', alt: 'Brown leather weekender bag', caption: 'The weekender', href: '/products/abuja-executive-weekender/' },
    ],
    excerpt: 'Tote, briefcase or crossbody? Pick the right bag for what you carry.',
    content: `## Start with what you carry

If you carry a laptop every day, choose a bag with a padded section. A structured briefcase protects it best; a large tote is more relaxed.

## Think about how you travel

- **Driving:** a briefcase or tote works well
- **Public transport:** a crossbody keeps your hands free
- **Lots of walking:** look for comfortable straps

Not sure which suits you? [Ask us on WhatsApp](/contact/) and we will help you choose.`,
    authorName: 'VendorLift',
    isPublished: true,
    publishedAt: '2026-10-08T09:00:00Z',
    createdAt: '2026-10-07T10:00:00Z',
    updatedAt: '2026-10-08T09:00:00Z',
    seoTitle: 'How to Choose a Leather Bag for Work',
    seoDescription: 'Tote, briefcase or crossbody? A simple guide to picking the right leather work bag for what you carry every day.',
  },
  {
    slug: 'oxfords-or-loafers',
    title: 'Oxfords or Loafers?',
    featuredImageUrl: '/images/brown-suede-loafers.webp',
    featuredImageAlt: 'Pair of brown suede penny loafers',
    gallery: [
      { url: '/images/brown-leather-oxford-shoes.webp', alt: 'Dark brown leather oxford shoes', caption: 'Oxfords: formal', href: '/products/lagos-classic-oxfords/' },
      { url: '/images/brown-suede-loafers.webp', alt: 'Brown suede penny loafers', caption: 'Loafers: relaxed', href: '/products/kano-suede-loafers/' },
    ],
    excerpt: 'Both are classics, but they suit different occasions.',
    content: `## When to wear oxfords

Oxfords are the more formal choice. Wear them with suits, to interviews, weddings and important meetings.

## When to wear loafers

Loafers are relaxed but still smart. They suit office days, church, dinners and weekends.

## The simple rule

If you are unsure, oxfords are never too formal. Loafers are best when comfort matters as much as style.`,
    authorName: 'VendorLift',
    isPublished: true,
    publishedAt: '2026-10-01T09:00:00Z',
    createdAt: '2026-09-30T10:00:00Z',
    updatedAt: '2026-10-01T09:00:00Z',
    seoTitle: 'Oxfords or Loafers: Which Should You Wear?',
    seoDescription: 'Oxfords or loafers? Learn which classic leather shoe suits each occasion, from interviews and weddings to relaxed weekends.',
  },
  {
    slug: 'find-your-shoe-size',
    title: 'Find Your Shoe Size at Home',
    featuredImageUrl: '/images/brown-leather-oxford-shoes.webp',
    featuredImageAlt: 'Pair of dark brown leather oxford shoes',
    gallery: [
      { url: '/images/brown-leather-oxford-shoes.webp', alt: 'Dark brown leather oxford shoes', caption: 'Oxfords', href: '/products/lagos-classic-oxfords/' },
      { url: '/images/brown-suede-loafers.webp', alt: 'Brown suede penny loafers', caption: 'Loafers', href: '/products/kano-suede-loafers/' },
      { url: '/images/enugu-chelsea-boots.webp', alt: 'Dark brown leather chelsea boots', caption: 'Chelsea boots', href: '/products/enugu-chelsea-boots/' },
    ],
    excerpt: 'Measure your feet in two minutes and order with confidence.',
    content: `## What you need

A sheet of paper, a pen and a ruler.

## How to measure

1. Stand on the paper with your heel against a wall
2. Mark the tip of your longest toe
3. Measure from the wall to the mark in centimetres

Send us your measurement on WhatsApp and we will tell you the right size.`,
    authorName: 'VendorLift',
    isPublished: true,
    publishedAt: '2026-09-24T09:00:00Z',
    createdAt: '2026-09-23T10:00:00Z',
    updatedAt: '2026-09-24T09:00:00Z',
  },
  {
    slug: 'draft-post-example',
    title: 'Draft: New Collection Preview',
    featuredImageUrl: '/images/brown-leather-weekender-bag.webp',
    featuredImageAlt: 'Brown leather weekender bag',
    excerpt: 'Not ready yet.',
    content: 'Coming soon.',
    isPublished: false,
    createdAt: '2026-10-18T10:00:00Z',
    updatedAt: '2026-10-18T10:00:00Z',
  },
  {
    slug: 'scheduled-post-example',
    title: 'Scheduled: Holiday Gift Guide',
    featuredImageUrl: '/images/tan-leather-tote-bag.webp',
    featuredImageAlt: 'Tan leather tote bag',
    excerpt: 'Goes live in December.',
    content: 'Coming soon.',
    isPublished: true,
    publishedAt: '2026-12-01T09:00:00Z',
    createdAt: '2026-10-18T10:00:00Z',
    updatedAt: '2026-10-18T10:00:00Z',
  },
];