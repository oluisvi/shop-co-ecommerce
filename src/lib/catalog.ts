import type { Product, ProductCategory } from "../types/store.ts";

export type CatalogSort = "featured" | "price-asc" | "price-desc" | "rating-desc";

export type CatalogFilters = {
  query?: string;
  categories?: ProductCategory[];
  maxPrice?: number;
};

const normalize = (value: string) => value.trim().toLocaleLowerCase();

export function getProductBySlug(products: Product[], slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductById(products: Product[], id: string) {
  return products.find((product) => product.id === id);
}

export function searchProducts(products: Product[], query: string) {
  const term = normalize(query);
  if (!term) return products;

  return products.filter((product) =>
    [product.name, product.category, product.collection]
      .map(normalize)
      .some((value) => value.includes(term)),
  );
}

export function filterProducts(products: Product[], filters: CatalogFilters) {
  const selectedCategories = new Set(filters.categories ?? []);
  const maxPrice = filters.maxPrice ?? Number.POSITIVE_INFINITY;

  return searchProducts(products, filters.query ?? "").filter((product) => {
    const categoryMatches =
      selectedCategories.size === 0 || selectedCategories.has(product.category);
    return categoryMatches && product.price <= maxPrice;
  });
}

export function sortProducts(products: Product[], sort: CatalogSort) {
  const copy = [...products];

  if (sort === "price-asc") return copy.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return copy.sort((a, b) => b.price - a.price);
  if (sort === "rating-desc") return copy.sort((a, b) => b.rating - a.rating);
  return copy;
}

export function deriveCategoryFacets(products: Product[]) {
  const categories = new Set<ProductCategory>();
  for (const product of products) categories.add(product.category);
  return [...categories].sort((a, b) => a.localeCompare(b));
}

export function getCatalogMaxPrice(products: Product[]) {
  let max = 0;
  for (const product of products) max = Math.max(max, product.price);
  return max;
}

export function getRelatedProducts(products: Product[], productId: string, limit = 4) {
  const source = getProductById(products, productId);
  if (!source) return [];

  const sameCategory = products.filter(
    (product) => product.id !== productId && product.category === source.category,
  );
  const remaining = products.filter(
    (product) => product.id !== productId && product.category !== source.category,
  );

  return [...sameCategory, ...remaining].slice(0, limit);
}
