import { apiFetch } from "./client.ts";
export type CategoryFacet = { slug: string; name: string; productCount: number };
export type CategoryResponse = { items: CategoryFacet[]; priceRange: { min: number; max: number } };
export function getCategories() { return apiFetch<CategoryResponse>("/categories"); }
