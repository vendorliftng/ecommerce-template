export type LeadStatus = 'new' | 'contacted' | 'closed';
export type LeadSource = 'contact_form' | 'product_inquiry';

export interface Lead {
  id: string;
  fullName: string;
  whatsappContact: string;      // international format, e.g. +2348012345678
  email?: string;
  message: string;
  sourceContext: LeadSource;
  productId?: string;           // product slug, if the lead came from a product page
  status: LeadStatus;
  notifiedAt: string | null;    // null = the WhatsApp alert was not sent
  createdAt: string;            // ISO date
}

const names = [
  'Amina Yusuf', 'Chinedu Okafor', 'Fatima Bello', 'Tunde Adeyemi', 'Ngozi Eze',
  'Ibrahim Musa', 'Zainab Abdullahi', 'Emeka Nwosu', 'Halima Sani', 'Segun Bakare',
];

const messages = [
  'Is this still available in size 43?',
  'Do you deliver to Kaduna? How long does it take?',
  'Can I see more photos of the brown colour?',
  'I would like to order two pairs. Any discount?',
  'What leather is the bag made from?',
  'Please call me back about a custom order.',
];

const productSlugs = ['lagos-classic-oxfords', 'abuja-executive-weekender', 'sokoto-heritage-tote', 'kano-suede-loafers'];
const failedAlerts = [2, 9, 17];

// 32 sample leads, one every 9 hours going back from 6 Nov 2026
export const mockLeads: Lead[] = Array.from({ length: 32 }, (_, i) => {
  const createdAt = new Date(Date.UTC(2026, 10, 6, 9) - i * 9 * 3_600_000).toISOString();
  const fromProduct = i % 3 !== 0;

  return {
    id: `lead-${i + 1}`,
    fullName: names[i % names.length],
    whatsappContact: `+23480${String(30000000 + i * 7919).slice(0, 8)}`,
    email: i % 4 === 0 ? `customer${i + 1}@example.com` : undefined,
    message: messages[i % messages.length],
    sourceContext: fromProduct ? 'product_inquiry' : 'contact_form',
    productId: fromProduct ? productSlugs[i % productSlugs.length] : undefined,
    status: i < 6 ? 'new' : i % 3 === 0 ? 'closed' : 'contacted',
    notifiedAt: failedAlerts.includes(i) ? null : createdAt,
    createdAt,
  };
});