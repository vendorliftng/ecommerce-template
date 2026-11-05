import { useState, type FormEvent } from 'react';
import { submitLead } from '@/lib/submitLead';

interface Props {
  sourceContext?: 'contact_form' | 'product_inquiry';
  productId?: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';
type Errors = Partial<Record<'fullName' | 'whatsappContact' | 'email' | 'message', string>>;

const WHATSAPP_PATTERN = /^\+[1-9]\d{7,14}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm({ sourceContext = 'contact_form', productId }: Props) {
  const [fullName, setFullName] = useState('');
  const [whatsappContact, setWhatsappContact] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot

  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState('');

  function validate(): Errors {
    const next: Errors = {};
    const phone = whatsappContact.replace(/[\s-]/g, '');

    if (!fullName.trim()) next.fullName = 'Please enter your name.';
    if (!phone) next.whatsappContact = 'Please enter your WhatsApp number.';
    else if (!WHATSAPP_PATTERN.test(phone)) next.whatsappContact = 'Use international format, e.g. +2348012345678.';
    if (email && !EMAIL_PATTERN.test(email)) next.email = 'Please enter a valid email, or leave it empty.';
    if (!message.trim()) next.message = 'Please tell us how we can help.';
    else if (message.length > 2000) next.message = 'Please keep your message under 2000 characters.';

    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus('submitting');
    const result = await submitLead({
      fullName: fullName.trim(),
      whatsappContact: whatsappContact.replace(/[\s-]/g, ''),
      email: email.trim() || undefined,
      message: message.trim(),
      sourceContext,
      productId,
      website,
    });

    setFeedback(result.message);
    setStatus(result.ok ? 'success' : 'error');
    if (result.ok) {
      setFullName('');
      setWhatsappContact('');
      setEmail('');
      setMessage('');
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="rounded-2xl bg-cream p-8 text-center">
        <p className="text-2xl font-semibold text-primary">Message sent ✓</p>
        <p className="mt-2 text-ink/70">{feedback}</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 rounded-xl border-2 border-primary px-6 py-2.5 font-semibold text-primary transition hover:bg-primary hover:text-white"
        >
          Send another message
        </button>
      </div>
    );
  }

  const labelClass = 'block text-base font-medium text-ink';
  const inputClass = (hasError: boolean) =>
    `mt-2 block w-full rounded-xl border bg-white px-4 py-3.5 text-ink outline-none transition placeholder:text-ink/40 focus:ring-2 ${
      hasError ? 'border-red-500 focus:ring-red-200' : 'border-ink/15 focus:border-primary focus:ring-primary/20'
    }`;
  const Required = () => <span className="text-red-600" aria-hidden="true"> *</span>;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Honeypot: hidden from people, bots fill it in */}
      <div style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <div>
        <label htmlFor="fullName" className={labelClass}>Full name<Required /></label>
        <input
          id="fullName" type="text" autoComplete="name" maxLength={100} required
          value={fullName} onChange={(e) => setFullName(e.target.value)}
          aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          className={inputClass(!!errors.fullName)} placeholder="Your name"
        />
        {errors.fullName && <p id="fullName-error" className="mt-1.5 text-sm text-red-600">{errors.fullName}</p>}
      </div>

      <div>
        <label htmlFor="whatsappContact" className={labelClass}>WhatsApp number (with country code)<Required /></label>
        <input
          id="whatsappContact" type="tel" inputMode="tel" autoComplete="tel" required
          value={whatsappContact} onChange={(e) => setWhatsappContact(e.target.value)}
          aria-invalid={!!errors.whatsappContact} aria-describedby={errors.whatsappContact ? 'whatsapp-error' : undefined}
          className={inputClass(!!errors.whatsappContact)} placeholder="+234 801 234 5678"
        />
        {errors.whatsappContact && <p id="whatsapp-error" className="mt-1.5 text-sm text-red-600">{errors.whatsappContact}</p>}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>Email <span className="font-normal text-ink/50">(optional)</span></label>
        <input
          id="email" type="email" autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined}
          className={inputClass(!!errors.email)} placeholder="you@example.com"
        />
        {errors.email && <p id="email-error" className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>Message<Required /></label>
        <textarea
          id="message" rows={5} maxLength={2000} required
          value={message} onChange={(e) => setMessage(e.target.value)}
          aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined}
          className={inputClass(!!errors.message)} placeholder="How can we help?"
        />
        {errors.message && <p id="message-error" className="mt-1.5 text-sm text-red-600">{errors.message}</p>}
      </div>

      {status === 'error' && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{feedback}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full rounded-xl bg-primary px-8 py-4 font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}