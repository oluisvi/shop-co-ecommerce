import type { CartLine } from "../cart.ts";
import type { Product, ProductVariant } from "../../types/store.ts";
import { getFallbackProduct, getFallbackProducts } from "../catalog-fallback.ts";
import { ApiError, apiFetch } from "./client.ts";
import { mapApiProduct } from "./mappers.ts";
export type ProductListParams = { search?: string; category?: string; sort?: string; maxPrice?: number; page?: number; limit?: number };
export type ProductListResponse = { items: Product[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
export type ReconciledCartItem = { variantId: string; requestedQuantity: number; quantity: number; availableQuantity: number; product: Product; variant: ProductVariant; lineTotal: number };
export type CartIssue = { variantId: string; type: "REMOVED" | "UNAVAILABLE" | "INSUFFICIENT_STOCK" | string; message: string };
function canUseFallback(error: unknown) { return !(error instanceof ApiError) || error.statusCode >= 500; }
function catalogTimeoutMs() { return typeof window === "undefined" ? 1500 : 4000; }
export async function listProducts(params: ProductListParams = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== "") query.set(key, String(value)); });
  const serialized = query.toString();
  try {
    const data = await apiFetch<ProductListResponse>(`/products${serialized ? `?${serialized}` : ""}`, undefined, { timeoutMs: catalogTimeoutMs() });
    return { ...data, items: data.items.map(mapApiProduct) };
  } catch (error) {
    if (!canUseFallback(error)) throw error;
    return getFallbackProducts(params);
  }
}
export async function getProduct(slug: string) {
  try {
    return mapApiProduct(await apiFetch<Product>(`/products/${encodeURIComponent(slug)}`, undefined, { timeoutMs: catalogTimeoutMs() }));
  } catch (error) {
    if (!canUseFallback(error)) throw error;
    const fallback = getFallbackProduct(slug);
    if (fallback) return fallback;
    throw error;
  }
}
export async function reconcileCart(items: CartLine[]) {
  if (!items.length) return { items: [] as ReconciledCartItem[], issues: [] as CartIssue[] };
  const result = await apiFetch<{ items: ReconciledCartItem[]; issues: CartIssue[] }>("/products/reconcile", { method: "POST", body: JSON.stringify({ items }) });
  return { ...result, items: result.items.map((item) => ({ ...item, product: mapApiProduct(item.product) })) };
}
