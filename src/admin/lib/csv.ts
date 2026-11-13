import type { Lead } from '../data/MockLeads';

/** Wrap a value for CSV and stop spreadsheet formula tricks. */
function cell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function leadsToCsv(leads: Lead[]): string {
  const header = ['Date', 'Name', 'WhatsApp', 'Email', 'Message', 'Source', 'Product', 'Status', 'Alert sent'];
  const rows = leads.map((lead) => [
    lead.createdAt,
    lead.fullName,
    lead.whatsappContact,
    lead.email ?? '',
    lead.message,
    lead.sourceContext,
    lead.productId ?? '',
    lead.status,
    lead.notifiedAt ? 'Yes' : 'No',
  ]);

  return [header, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');
}

export function downloadFile(filename: string, content: string) {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}