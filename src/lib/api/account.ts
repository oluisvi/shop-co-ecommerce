import { apiFetch } from './client';
import type { ProfileRole } from '../auth-navigation';

export type AccountProfile = {
  id: string; email: string; firstName: string | null; lastName: string | null;
  phone: string | null; role: ProfileRole; createdAt: string;
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

export function updateAccountProfile(accessToken: string, input: { firstName?: string; lastName?: string; phone?: string }) {
  return apiFetch<AccountProfile>('/account', {
    method: 'PATCH',
    headers: { ...auth(accessToken).headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export function listAccountOrders(accessToken: string) {
  return apiFetch<AccountOrder[]>('/account/orders', auth(accessToken));
}
