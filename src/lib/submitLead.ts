export interface LeadInput {
  fullName: string;
  whatsappContact: string;
  email?: string;
  message: string;
  sourceContext: 'contact_form' | 'product_inquiry';
  productId?: string;
  turnstileToken?: string; // TODO: add Cloudflare Turnstile when the backend gives us the site key
  website: string;         // honeypot: real people leave this empty
}

export interface LeadResult {
  ok: boolean;
  message: string;
}

const API_URL = import.meta.env.PUBLIC_CONTACT_API_URL;

export async function submitLead(input: LeadInput): Promise<LeadResult> {
  // No backend yet: pretend it worked
  if (!API_URL) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.info('[submitLead] No API URL set. Simulated submit:', input);
    return { ok: true, message: "Thanks! We'll reach you on WhatsApp soon." };
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (res.ok) {
      return { ok: true, message: "Thanks! We'll reach you on WhatsApp soon." };
    }
    if (res.status === 400) {
      const data = await res.json().catch(() => null);
      return { ok: false, message: data?.message ?? 'Please check your details and try again.' };
    }
    if (res.status === 429) {
      return { ok: false, message: 'Too many attempts. Please wait a minute and try again.' };
    }
    return { ok: false, message: 'Something went wrong. Please try again or message us on WhatsApp.' };
  } catch {
    return { ok: false, message: "We couldn't send your message. Check your connection and try again." };
  }
}