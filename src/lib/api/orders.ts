import { apiFetch } from "./client.ts";
export type CreateOrderInput = {
  customer: { email: string; firstName: string; lastName: string };
  shippingAddress: { firstName: string; lastName: string; addressLine1: string; addressLine2?: string; city: string; state: string; postalCode: string; country: string };
  items: { variantId: string; quantity: number }[];
};
export type CreatedOrder = { id: number; orderNumber: string; status: string; subtotal: number; shipping: number; discount: number; total: number; currency: string };
export function createOrder(input: CreateOrderInput) { return apiFetch<CreatedOrder>("/orders", { method: "POST", body: JSON.stringify(input) }); }
