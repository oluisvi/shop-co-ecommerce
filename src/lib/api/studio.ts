import { apiFetch } from './client';

export type StudioDashboard = { activePieces: number; draftPieces: number; soldOutPieces: number; paidOrders: number; recentOrders: Array<{ id: number; orderNumber: string; status: string; total: string; currency: string }> };
export type StudioCategory = { id: string; slug: string; name: string };
export type StudioProductInput = {
  name: string; slug: string; description?: string; categoryId: string; collection: string; cardImage: string;
  priceCents: number; condition?: string; conditionNotes?: string; brand?: string; material?: string;
  imperfections?: string; size?: string; color?: string; published: boolean;
};
const bearer = (accessToken: string) => ({ Authorization: `Bearer ${accessToken}` });

export function getStudioDashboard(accessToken: string) { return apiFetch<StudioDashboard>('/studio/dashboard', { headers: bearer(accessToken) }); }
export function getStudioCategories(accessToken: string) { return apiFetch<StudioCategory[]>('/studio/categories', { headers: bearer(accessToken) }); }
export function createStudioProduct(accessToken: string, input: StudioProductInput) {
  return apiFetch('/studio/products', { method: 'POST', headers: bearer(accessToken), body: JSON.stringify(input) });
}
export function uploadStudioImage(accessToken: string, file: File) {
  const body = new FormData(); body.append('image', file);
  return apiFetch<{ url: string; objectPath: string }>('/studio/uploads', { method: 'POST', headers: bearer(accessToken), body });
}
