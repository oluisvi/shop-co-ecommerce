import { apiFetch } from './client';

export type AccountProfile = {
  id: string; email: string; firstName: string | null; lastName: string | null;
  phone: string | null; createdAt: string;
};
export type AccountOrder = {
  id: number; orderNumber: string; status: string; total: string | number; currency: string;
  createdAt: string; paidAt: string | null;
  items: Array<{ id: string; productName: string; variantName: string; quantity: number; totalPrice: string | number }>;
};

const auth = (accessToken: string): RequestInit => ({ headers: { Authorization: `Bearer ${accessToken}` } });

export function getAccountProfile(accessToken: string) {
  return apiFetch<AccountProfile>('/account', auth(accessToken));
}

export function listAccountOrders(accessToken: string) {
  return apiFetch<AccountOrder[]>('/account/orders', auth(accessToken));
}
