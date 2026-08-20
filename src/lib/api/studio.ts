import { apiFetch } from './client';

export type StudioDashboard = { activePieces: number; draftPieces: number; soldOutPieces: number; paidOrders: number; recentOrders: Array<{ id: number; orderNumber: string; status: string; total: string; currency: string }> };
export type StudioCategory = { id: string; slug: string; name: string };
export type StudioProduct = { id: string; name: string; status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'; variants: Array<{ id: string; price: string; inventory: { quantity: number; reservedQuantity: number } | null }> };
export type StudioOrder = { orderNumber: string; status: string; total: string; currency: string; items: Array<{ id: string; productName: string; quantity: number }> };
export type StudioProductInput = {
  name: string; slug: string; description?: string; categoryId: string; collection: string; cardImage: string;
  priceCents: number; condition?: string; conditionNotes?: string; brand?: string; material?: string;
  imperfections?: string; size?: string; color?: string; published: boolean;
};
const bearer = (accessToken: string) => ({ Authorization: `Bearer ${accessToken}` });

export function getStudioDashboard(accessToken: string) { return apiFetch<StudioDashboard>('/studio/dashboard', { headers: bearer(accessToken) }); }
export function getStudioCategories(accessToken: string) { return apiFetch<StudioCategory[]>('/studio/categories', { headers: bearer(accessToken) }); }
export function getStudioProducts(accessToken: string) { return apiFetch<StudioProduct[]>('/studio/products', { headers: bearer(accessToken) }); }
export function archiveStudioProduct(accessToken: string, id: string) { return apiFetch(`/studio/products/${id}/archive`, { method: 'POST', headers: bearer(accessToken) }); }
export function adjustStudioInventory(accessToken: string, variantId: string, quantity: number) { return apiFetch(`/studio/inventory/${variantId}`, { method: 'PATCH', headers: bearer(accessToken), body: JSON.stringify({ quantity }) }); }
export function getStudioOrders(accessToken: string) { return apiFetch<StudioOrder[]>('/studio/orders', { headers: bearer(accessToken) }); }
export function updateStudioOrderStatus(accessToken: string, orderNumber: string, status: string) { return apiFetch(`/studio/orders/${orderNumber}/status`, { method: 'PATCH', headers: bearer(accessToken), body: JSON.stringify({ status }) }); }
export function createStudioProduct(accessToken: string, input: StudioProductInput) {
  return apiFetch('/studio/products', { method: 'POST', headers: bearer(accessToken), body: JSON.stringify(input) });
}
export function updateStudioProduct(accessToken: string, id: string, input: { name: string; priceCents: number; published: boolean }) {
  return apiFetch(`/studio/products/${id}`, { method: 'PATCH', headers: bearer(accessToken), body: JSON.stringify(input) });
}
export function uploadStudioImage(accessToken: string, file: File) {
  const body = new FormData(); body.append('image', file);
  return apiFetch<{ url: string; objectPath: string }>('/studio/uploads', { method: 'POST', headers: bearer(accessToken), body });
}
