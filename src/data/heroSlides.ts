export interface HeroSlide {
  badge?: string;
  headline: string;
  highlight?: string;
  text: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  imageAlt: string;
  textColor?: 'dark' | 'light'; // 'dark' for light photos (default), 'light' for dark photos
}

export const heroSlides: HeroSlide[] = [
  {
    badge: 'New in',
    headline: 'Shoes That Keep Up With You',
    highlight: 'Keep Up',
    text: 'Oxfords, loafers and boots for work, church and weekends.',
    ctaLabel: 'Shop shoes',
    ctaHref: '/products/',
    imageUrl: '/images/brown-full-grain-leather-weekender-bag-on-the-right-of-a-warm-beige-studio-background.webp', // TODO: swap for a shoes photo
    imageAlt: 'Brown full-grain leather weekender bag on a warm beige background',
  },
  {
    badge: 'Everyday bags',
    headline: 'Carry More, Look Sharp',
    highlight: 'Look Sharp',
    text: 'Totes and briefcases made for busy days.',
    ctaLabel: 'Shop bags',
    ctaHref: '/products/',
    imageUrl: '/images/brown-full-grain-leather-weekender-bag-on-the-right-of-a-warm-beige-studio-background.webp',
    imageAlt: 'Brown full-grain leather weekender bag on a warm beige background',
  },
  {
    badge: 'Travel ready',
    headline: 'Pack Light, Travel Well',
    highlight: 'Travel Well',
    text: 'Weekenders and backpacks for every trip.',
    ctaLabel: 'View the weekender',
    ctaHref: '/products/abuja-executive-weekender/',
    imageUrl: '/images/tan-leather-tote-and-brown-loafers-arranged-on-the-right-against-a-warm-neutral-background.webp',
    imageAlt: 'Tan leather tote bag and brown leather loafers on a warm neutral background',
  },
];