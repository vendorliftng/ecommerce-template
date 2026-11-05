export type ProductStatus = 'active' | 'out_of_stock' | 'draft';

export interface Product {
  slug: string;
  title: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
  shortDescription: string;
  longDescription?: string;
  price: number;
  currency: string;
  status: ProductStatus;
  seoTitle?: string;
  seoDescription?: string;
}

export const products: Product[] = [
  {
    slug: 'abuja-executive-weekender',
    title: 'Abuja Executive Weekender',
    featuredImageUrl: '/images/brown-full-grain-leather-weekender-bag-on-the-right-of-a-warm-beige-studio-background.webp',
    featuredImageAlt: 'Brown full-grain leather weekender bag on a warm beige background',
    shortDescription: 'Full-grain leather travel bag for weekend trips and business travel.',
    longDescription:
      'A roomy main compartment, solid brass hardware and a detachable padded shoulder strap. The full-grain leather softens and darkens beautifully with use, so the bag looks better every year.',
    price: 185000,
    currency: 'NGN',
    status: 'active',
    seoTitle: 'Abuja Executive Leather Weekender Bag',
    seoDescription:
      'Full-grain brown leather weekender bag with brass hardware and a shoulder strap. Enquire on WhatsApp.',
  },
  
  {
    slug: 'lagos-classic-oxfords',
    title: 'Lagos Classic Oxfords',
    featuredImageUrl: '/images/shoes.png',
    featuredImageAlt: 'Pair of dark brown leather cap-toe oxford shoes',
    shortDescription: 'Polished cap-toe oxfords for the office and special occasions.',
    longDescription:
      'Hand-finished leather upper, soft leather lining and a durable stitched sole. A timeless shoe that pairs with suits, kaftans and smart trousers.',
    price: 120000,
    currency: 'NGN',
    status: 'active',
    seoTitle: 'Lagos Classic Brown Leather Oxford Shoes',
    seoDescription:
      'Hand-finished dark brown cap-toe leather oxfords for work and occasions. Ask about sizes on WhatsApp.',
  },
  {
    slug: 'sokoto-heritage-tote',
    title: 'Sokoto Heritage Tote',
    featuredImageUrl: '/images/shoess.png',
    featuredImageAlt: 'Tan leather tote bag shown with brown leather loafers',
    shortDescription: 'An everyday tote in soft tan leather.',
    longDescription:
      'Big enough for a laptop, a water bottle and everything else you carry in a day. Long handles sit comfortably on the shoulder.',
    price: 95000,
    currency: 'NGN',
    status: 'active',
    seoTitle: 'Sokoto Heritage Tan Leather Tote Bag',
    seoDescription:
      'Soft tan leather tote bag with long shoulder handles, roomy enough for a laptop. Enquire on WhatsApp.',
  },
  {
    slug: 'kano-suede-loafers',
    title: 'Kano Suede Loafers',
    featuredImageUrl: '/images/tan-leather-tote-and-brown-loafers-arranged-on-the-right-against-a-warm-neutral-background.webp',
    featuredImageAlt: 'Pair of brown suede penny loafers',
    shortDescription: 'Soft suede loafers for relaxed, smart outfits.',
    longDescription:
      'Slip-on comfort with a flexible sole and a soft suede upper. Easy to dress up or down.',
    price: 85000,
    currency: 'NGN',
    status: 'active',
    seoTitle: 'Kano Brown Suede Penny Loafers',
    seoDescription:
      'Comfortable brown suede penny loafers with a flexible sole. Ask about sizes on WhatsApp.',
  },
  {
    slug: 'enugu-chelsea-boots',
    title: 'Enugu Chelsea Boots',
    featuredImageUrl: '/images/shoes.png', // TODO: add image
    featuredImageAlt: 'Dark brown leather chelsea boots with elastic side panels',
    shortDescription: 'Classic pull-on boots with a comfortable cushioned sole.',
    longDescription:
      'Smooth leather upper, elastic side panels for easy on and off, and a cushioned sole for all-day wear.',
    price: 140000,
    currency: 'NGN',
    status: 'out_of_stock',
    seoTitle: 'Enugu Dark Brown Leather Chelsea Boots',
    seoDescription:
      'Pull-on dark brown leather chelsea boots with a cushioned sole. Message us on WhatsApp for restock news.',
  },
  {
    slug: 'kaduna-leather-briefcase',
    title: 'Kaduna Leather Briefcase',
    featuredImageUrl: '/images/shoes.png', // TODO: add image
    featuredImageAlt: 'Structured brown leather briefcase with top handle',
    shortDescription: 'A structured briefcase for documents and a 15-inch laptop.',
    longDescription:
      'Padded laptop section, organiser pockets for pens and cards, and a removable shoulder strap. Built to keep its shape.',
    price: 160000,
    currency: 'NGN',
    status: 'active',
    seoTitle: 'Kaduna Structured Brown Leather Briefcase',
    seoDescription:
      'Structured brown leather briefcase with a padded 15-inch laptop section. Enquire on WhatsApp.',
  },
  {
    slug: 'ibadan-travel-backpack',
    title: 'Ibadan Travel Backpack',
    featuredImageUrl: '/images/shoes.png', 
    featuredImageAlt: 'Brown leather travel backpack with front pocket',
    shortDescription: 'Coming soon.',
    price: 150000,
    currency: 'NGN',
    status: 'draft',
  },
];