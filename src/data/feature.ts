export type FeatureIcon = 'sparkles' | 'shield' | 'chat' | 'bag' | 'truck' | 'badge';

export interface Feature {
  icon: FeatureIcon;
  text: string;
}

// TODO: confirm with the client which claims are true before launch
export const features: Feature[] = [
  { icon: 'sparkles', text: 'Handcrafted finish' },      // confirm
  { icon: 'shield', text: 'Genuine leather' },           // confirm
  { icon: 'chat', text: 'Order easily on WhatsApp' },
  { icon: 'bag', text: 'Shoes and bags for every occasion' },
  { icon: 'truck', text: 'Delivery across Nigeria' },    // confirm
  { icon: 'badge', text: 'Quality checked before delivery' }, // confirm
];