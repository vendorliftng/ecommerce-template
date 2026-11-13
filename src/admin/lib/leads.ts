import { mockLeads, type Lead, type LeadStatus } from '../data/MockLeads';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory copy so status changes "stick" until you refresh
let store: Lead[] = [...mockLeads];

/** All leads, newest first. */
export async function fetchLeads(): Promise<Lead[]> {
  // TODO: Firebase — query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(25)) with paging
  await wait(300);
  return [...store].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Change a lead's status: new, contacted or closed. */
export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  // TODO: Firebase — updateDoc(doc(db, 'leads', id), { status })
  await wait(200);
  store = store.map((lead) => (lead.id === id ? { ...lead, status } : lead));
}