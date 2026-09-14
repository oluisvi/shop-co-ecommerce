import { fallbackFacets } from "../catalog-fallback.ts";
import { ApiError, apiFetch } from "./client.ts";
export type CategoryFacet = { slug: string; name: string; productCount: number };
export type CategoryResponse = { items: CategoryFacet[]; priceRange: { min: number; max: number } };
function canUseFallback(error: unknown) { return !(error instanceof ApiError) || error.statusCode >= 500; }
function catalogTimeoutMs() { return typeof window === "undefined" ? 1500 : 4000; }
export async function getCategories() {
  try {
    return await apiFetch<CategoryResponse>("/categories", undefined, { timeoutMs: catalogTimeoutMs() });
  } catch (error) {
    if (!canUseFallback(error)) throw error;
    return fallbackFacets;
  }
}
