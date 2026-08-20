import type { CreateOrderInput } from './orders';
import { apiFetch } from './client';

export type CheckoutSessionResponse = { orderNumber: string; sessionId: string; url: string; expiresAt: number };
export type CheckoutStatus = { orderNumber: string; status: string; subtotal: string | number; shipping: string | number; total: string | number; currency: string; paidAt: string | null };

export function createCheckoutSession(input: CreateOrderInput, accessToken?: string | null) {
  return apiFetch<CheckoutSessionResponse>('/checkout/sessions', {
    method: 'POST', headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined, body: JSON.stringify(input),
  });
}
export function getCheckoutStatus(sessionId: string) {
  return apiFetch<CheckoutStatus>(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
}
