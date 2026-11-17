// ---------- Images you actually have in public/images ----------
// Keeping them in one place means a typo can only happen once.
const IMG = {
  weekender: '/images/brown-full-grain-leather-weekender-bag-on-the-right-of-a-warm-beige-studio-background.webp',
  toteLoafers: '/images/tan-leather-tote-and-brown-loafers-arranged-on-the-right-against-a-warm-neutral-background.webp',
  brown: '/images/brown.webp',
  nude: '/images/nude.webp',
  craft: '/images/craft.webp',
  shoes: '/images/shoes.png',
  shoes2: '/images/shoess.png',
};

export interface GalleryImage {
  url: string;
  alt: string;
  caption?: string;
  href?: string; // optional link, e.g. to a collection
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown
  featuredImageUrl: string;
  featuredImageAlt: string;
  ogImageUrl?: string;
  gallery?: GalleryImage[]; // not in the PRD yet: tell the backend team
  authorName?: string;
  isPublished: boolean;
  publishedAt: string | null; // ISO date; a future date = scheduled
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
}

export const posts: Post[] = [
  {
    slug: 'how-to-care-for-leather-shoes',
    title: 'How to Care for Your Leather Shoes',
    excerpt: 'Simple habits that keep leather shoes looking good and lasting for years.',
    featuredImageUrl: IMG.craft,
    featuredImageAlt: 'Hands stitching brown leather on a wooden workbench',
    gallery: [
      { url: IMG.shoes, alt: 'Pair of leather shoes', caption: 'Shop shoes', href: '/collections/shoes/' },
      { url: IMG.brown, alt: 'Brown leather product close-up' },
      { url: IMG.shoes2, alt: 'Leather shoes from the side' },
    ],
    isPublished: true,
    publishedAt: '2026-10-28T09:00:00.000Z',
    updatedAt: '2026-10-28T09:00:00.000Z',
    seoTitle: 'How to Care for Leather Shoes',
    seoDescription: 'Easy leather shoe care: cleaning, conditioning, drying and storing, so your shoes stay smart for years.',
    content: `Good leather shoes can last for years if you look after them. The good news is that it only takes a few minutes a week.

## Clean them often

Wipe off dust and dirt with a soft, dry cloth after wearing. For tougher marks, use a slightly damp cloth, then let the shoes dry naturally.

## Condition the leather

Leather can dry out, especially in hot weather. Apply a little leather conditioner every few weeks to keep it soft and stop it cracking.

## Let them rest

Try not to wear the same pair every day. A day of rest lets the leather dry out and keep its shape.

## Store them well

- Keep shoes in a cool, dry place, away from direct sun
- Use shoe trees or stuff them with paper to hold their shape
- Store them in a cloth bag, not plastic, so the leather can breathe

Have a question about caring for a particular pair? Message us on WhatsApp and we'll be happy to help.`,
  },
  {
    slug: 'choosing-the-right-travel-bag',
    title: 'Choosing the Right Travel Bag',
    excerpt: 'Weekend trip or business travel? Here is how to pick a bag that fits the way you travel.',
    featuredImageUrl: IMG.weekender,
    featuredImageAlt: 'Brown leather weekender bag on a warm beige background',
    gallery: [
      { url: IMG.weekender, alt: 'Leather weekender bag', caption: 'Shop travel bags', href: '/collections/travel/' },
      { url: IMG.toteLoafers, alt: 'Tan leather tote and brown loafers' },
    ],
    isPublished: true,
    publishedAt: '2026-11-03T09:00:00.000Z',
    updatedAt: '2026-11-03T09:00:00.000Z',
    seoTitle: 'How to Choose a Leather Travel Bag',
    seoDescription: 'Size, handles, pockets and style: a simple guide to choosing a leather travel bag that suits your trips.',
    content: `The right travel bag makes every trip easier. Before you choose, think about how you usually travel.

## Think about size

For a weekend away, a medium weekender is usually enough. For longer trips, look for a bigger bag, or pair a weekender with a smaller tote.

## Check the handles and strap

Strong handles make the bag easy to carry. A shoulder strap is useful when your hands are full at the airport or the motor park.

## Look at the pockets

- An inside pocket keeps your phone, charger and documents safe
- An outside pocket gives quick access to tickets and keys

## Pick a style you'll keep using

Simple colours like brown and tan go with almost everything, from work clothes to casual outfits.

Not sure which size suits you? Send us a message on WhatsApp and tell us about your trips.`,
  },
  {
    slug: 'everyday-bag-styling-tips',
    title: 'Everyday Bag Styling Tips',
    excerpt: 'Easy ways to match your leather bag with your outfits, from the office to the weekend.',
    featuredImageUrl: IMG.toteLoafers,
    featuredImageAlt: 'Tan leather tote and brown loafers on a warm neutral background',
    gallery: [
      { url: IMG.nude, alt: 'Nude leather product', caption: 'Shop bags', href: '/collections/bags/' },
      { url: IMG.brown, alt: 'Brown leather product' },
      { url: IMG.toteLoafers, alt: 'Tan leather tote with loafers' },
    ],
    isPublished: true,
    publishedAt: '2026-11-07T09:00:00.000Z',
    updatedAt: '2026-11-07T09:00:00.000Z',
    seoTitle: 'Everyday Leather Bag Styling Tips',
    seoDescription: 'How to match a leather bag with your shoes and outfits for work, events and the weekend.',
    content: `A good leather bag can work with almost any outfit. Here are a few simple ideas.

## Match your bag and shoes

Pairing a tan bag with brown shoes looks put-together without trying too hard. You don't need an exact match, just colours from the same family.

## Neutral colours go further

Brown, tan and nude bags work with bright prints, plain colours and traditional outfits alike.

## Pick the right size for the day

- A tote fits a laptop and documents for work
- A smaller bag is easier for events and outings
- A weekender is best for short trips

Want help choosing a bag to go with a particular outfit? Send us a picture on WhatsApp.`,
  },
  {
    slug: 'finding-your-shoe-size',
    title: 'Finding Your Right Shoe Size',
    excerpt: 'A few easy steps to get the right fit when you order shoes.',
    featuredImageUrl: IMG.shoes,
    featuredImageAlt: 'Pair of leather shoes',
    gallery: [
      { url: IMG.shoes2, alt: 'Leather shoes from the side', caption: 'Shop shoes', href: '/collections/shoes/' },
      { url: IMG.brown, alt: 'Brown leather close-up' },
    ],
    isPublished: true,
    publishedAt: '2026-11-10T09:00:00.000Z',
    updatedAt: '2026-11-10T09:00:00.000Z',
    seoTitle: 'How to Find Your Right Shoe Size',
    seoDescription: 'Measure your feet at home and get the right fit when ordering leather shoes.',
    content: `Getting the right size is the most important part of buying shoes. Here is a simple way to check.

## Measure your feet at home

1. Stand on a sheet of paper with your heel against a wall
2. Mark the tip of your longest toe
3. Measure from the wall to the mark, in centimetres

## Measure in the evening

Feet can be slightly bigger later in the day, so evening measurements give a more comfortable fit.

## Between two sizes?

Leather softens and shapes to your foot with wear. If you are unsure, tell us your measurement and we'll help you choose.

Send us your foot length on WhatsApp and we'll recommend a size before you order.`,
  },
  {
    slug: 'how-our-pieces-are-made',
    title: 'How Our Pieces Are Made',
    excerpt: 'A look at the care that goes into every pair of shoes and every bag.',
    featuredImageUrl: IMG.craft,
    featuredImageAlt: 'Hands stitching brown leather on a wooden workbench',
    gallery: [
      { url: IMG.brown, alt: 'Brown leather close-up' },
      { url: IMG.nude, alt: 'Nude leather close-up' },
      { url: IMG.weekender, alt: 'Finished leather weekender bag' },
    ],
    isPublished: true,
    publishedAt: '2026-11-14T09:00:00.000Z',
    updatedAt: '2026-11-14T09:00:00.000Z',
    seoTitle: 'How Our Leather Pieces Are Made',
    seoDescription: 'From choosing the leather to the final check: how each pair of shoes and each bag is made.',
    // TODO: replace with the client's real process before launch
    content: `Every piece goes through a few careful steps before it reaches you.

## Choosing the leather

We pick leather for comfort, strength and how it looks over time.

## Cutting and stitching

Each part is cut to shape, then stitched with care so the seams hold up to everyday use.

## Finishing

Edges are smoothed and every piece is checked before it is ready.

Have a question about how a piece is made? Ask us on WhatsApp.`,
  },
  {
    slug: 'gift-ideas-leather',
    title: 'Leather Gift Ideas',
    excerpt: 'Thoughtful leather gifts for birthdays, weddings and celebrations.',
    featuredImageUrl: IMG.nude,
    featuredImageAlt: 'Nude leather product on a neutral background',
    isPublished: false, // draft: hidden from the website
    publishedAt: null,
    updatedAt: '2026-11-15T09:00:00.000Z',
    content: `Draft: gift ideas post. Finish before publishing.`,
  },
];