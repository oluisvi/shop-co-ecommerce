import type { CartLine } from "../cart.ts";
import type { Product, ProductVariant } from "../../types/store.ts";
import { apiFetch } from "./client.ts";
import { mapApiProduct } from "./mappers.ts";
export type ProductListParams = { search?: string; category?: string; sort?: string; maxPrice?: number; page?: number; limit?: number };
export type ProductListResponse = { items: Product[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
export type ReconciledCartItem = { variantId: string; requestedQuantity: number; quantity: number; availableQuantity: number; product: Product; variant: ProductVariant; lineTotal: number };
export type CartIssue = { variantId: string; type: "REMOVED" | "UNAVAILABLE" | "INSUFFICIENT_STOCK" | string; message: string };
export async function listProducts(params: ProductListParams = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== "") query.set(key, String(value)); });
  const serialized = query.toString();
  const data = await apiFetch<ProductListResponse>(`/products${serialized ? `?${serialized}` : ""}`);
  return { ...data, items: data.items.map(mapApiProduct) };
}
export async function getProduct(slug: string) { return mapApiProduct(await apiFetch<Product>(`/products/${encodeURIComponent(slug)}`)); }
export async function reconcileCart(items: CartLine[]) {
  if (!items.length) return { items: [] as ReconciledCartItem[], issues: [] as CartIssue[] };
  const result = await apiFetch<{ items: ReconciledCartItem[]; issues: CartIssue[] }>("/products/reconcile", { method: "POST", body: JSON.stringify({ items }) });
  return { ...result, items: result.items.map((item) => ({ ...item, product: mapApiProduct(item.product) })) };
}
