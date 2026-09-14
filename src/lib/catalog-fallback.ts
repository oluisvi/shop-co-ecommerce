import { categoryProducts } from "../data/catalog.ts";
import type { Product, ProductCategory } from "../types/store.ts";

export type FallbackProductListParams = {
  search?: string;
  category?: string;
  sort?: string;
  maxPrice?: number;
  page?: number;
  limit?: number;
};

const categorySlugByName: Record<ProductCategory, string> = {
  "T-shirts": "t-shirts",
  Shirts: "shirts",
  Jeans: "jeans",
  Shorts: "shorts",
  Polos: "polos",
};

const prices = categoryProducts.map((product) => product.price);

export const fallbackFacets = {
  items: (Object.entries(categorySlugByName) as [ProductCategory, string][]).map(([name, slug]) => ({
    slug,
    name,
    productCount: categoryProducts.filter((product) => product.category === name).length,
  })),
  priceRange: {
    min: Math.min(...prices),
    max: Math.max(...prices),
  },
};

function categorySlug(product: Product) {
  return product.categorySlug ?? categorySlugByName[product.category];
}

export function getFallbackProducts(params: FallbackProductListParams = {}) {
  let items = [...categoryProducts];
  const search = params.search?.trim().toLowerCase();
  if (search) {
    items = items.filter((product) =>
      [product.name, product.category, product.collection].some((value) => value.toLowerCase().includes(search)),
    );
  }

  const selectedCategories = params.category?.split(",").map((value) => value.trim()).filter(Boolean) ?? [];
  if (selectedCategories.length) {
    items = items.filter((product) => selectedCategories.includes(categorySlug(product)));
  }

  if (typeof params.maxPrice === "number" && Number.isFinite(params.maxPrice)) {
    items = items.filter((product) => product.price <= params.maxPrice!);
  }

  if (params.sort === "price-asc") items.sort((a, b) => a.price - b.price);
  if (params.sort === "price-desc") items.sort((a, b) => b.price - a.price);
  if (params.sort === "rating-desc") items.sort((a, b) => b.rating - a.rating);

  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, params.limit ?? Math.max(items.length, 1));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    pagination: { page, limit, total, totalPages },
  };
}

export function getFallbackProduct(slug: string) {
  return categoryProducts.find((product) => product.slug === slug);
}
