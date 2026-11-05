export interface Collection {
  title: string;
  description?: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
}

// TODO (Phase 2): change each href to /collections/<slug>/ once products have a category field
export const collections: Collection[] = [
  {
    title: 'Shoes',
    description: 'Oxfords, loafers and boots',
    href: '/products/',
    imageUrl: '/images/shoes.png',
    imageAlt: 'Pair of dark brown leather oxford shoes',
  },
  {
    title: 'Bags',
    description: 'Totes, briefcases and crossbodies',
    href: '/products/',
    imageUrl: '/images/nude.webp',
    imageAlt: 'Tan leather tote bag',
  },
  {
    title: 'Travel',
    description: 'Weekenders made for the road',
    href: '/products/',
    imageUrl: '/images/brown.webp',
    imageAlt: 'Brown leather weekender bag',
  },
];