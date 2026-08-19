import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import SiteHead from "@/components/SiteHead";
import SiteLayout from "@/components/SiteLayout";
import ProductCard from "@/components/ProductCard";
import { CloseIcon, MenuIcon } from "@/components/Icons";
import { getCategories, type CategoryResponse } from "@/lib/api/categories";
import { listProducts } from "@/lib/api/products";
import type { Product, ProductCategory } from "@/types/store";

function asString(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] ?? "" : value ?? ""; }
function parseSort(value: string | string[] | undefined) {
  const raw = asString(value);
  return raw === "price-asc" || raw === "price-desc" || raw === "rating-desc" ? raw : "featured";
}

type Props = { initialProducts: Product[]; facets: CategoryResponse };
export default function Categories({ initialProducts, facets }: Props) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterTrigger = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const skipInitialCatalogFetch = useRef(true);
  const query = asString(router.query.q);
  const selectedSlugs = asString(router.query.category).split(",").filter((slug) => facets.items.some((item) => item.slug === slug));
  const selectedCategoryKey = selectedSlugs.join(",");
  const sort = parseSort(router.query.sort);
  const maxPriceRaw = Number(asString(router.query.max));
  const maxPrice = Number.isFinite(maxPriceRaw) && maxPriceRaw > 0 ? Math.min(facets.priceRange.max, Math.max(facets.priceRange.min, maxPriceRaw)) : facets.priceRange.max;

  useEffect(() => {
    if (!router.isReady) return;
    if (skipInitialCatalogFetch.current) {
      skipInitialCatalogFetch.current = false;
      return;
    }
    let alive = true;
    setLoading(true);
    setLoadError("");
    const catalogFetchTimer = window.setTimeout(() => {
      void listProducts({ search: query || undefined, category: selectedCategoryKey || undefined, sort, maxPrice: maxPrice < facets.priceRange.max ? maxPrice : undefined, limit: 100 })
        .then((result) => { if (alive) setProducts(result.items); })
        .catch(() => { if (alive) setLoadError("The catalog could not be refreshed. Try again."); })
        .finally(() => { if (alive) setLoading(false); });
    }, 140);
    return () => {
      alive = false;
      window.clearTimeout(catalogFetchTimer);
    };
  }, [router.isReady, query, selectedCategoryKey, sort, maxPrice, facets.priceRange.max]);

  const updateQuery = (patch: Record<string, string | undefined>) => {
    const next: Record<string, string> = {};
    for (const [key, value] of Object.entries(router.query)) { const normalized = asString(value); if (normalized) next[key] = normalized; }
    for (const [key, value] of Object.entries(patch)) { if (value) next[key] = value; else delete next[key]; }
    void router.replace({ pathname: "/categories", query: next }, undefined, { shallow: true, scroll: false });
  };
  const clearFilters = () => updateQuery({ q: undefined, category: undefined, max: undefined, sort: undefined });

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1100px)");
    const syncLayout = () => { if (desktop.matches) setFiltersOpen(false); };
    syncLayout(); desktop.addEventListener("change", syncLayout); return () => desktop.removeEventListener("change", syncLayout);
  }, []);
  useEffect(() => {
    if (!filtersOpen) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = filterTrigger.current;
    const panel = document.getElementById("filter-panel");
    document.body.style.overflow = "hidden"; closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setFiltersOpen(false); return; }
      if (event.key !== "Tab") return;
      const controls = panel?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
      if (!controls?.length) return;
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); trigger?.focus(); };
  }, [filtersOpen]);

  const activeFilterCount = selectedSlugs.length + (maxPrice < facets.priceRange.max ? 1 : 0) + (query ? 1 : 0);
  return <>
    <SiteHead title="Fashion Catalog | SHOP.CO" description="Search, filter and sort the SHOP.CO fashion edit." path="/categories" />
    <SiteLayout>
      <section className="category-masthead"><div className="container"><nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Shop</span></nav><p className="issue-label">Catalog / Full edit</p><h1>Find your<br /><span>next piece.</span></h1><div className="catalog-summary"><p>{products.length} products in the live catalog</p><p>Search · filter · sort</p></div></div></section>
      <section className="catalog-section"><div className="container catalog-layout">
        <button ref={filterTrigger} className="button filter-trigger" type="button" aria-expanded={filtersOpen} aria-controls="filter-panel" onClick={() => setFiltersOpen(true)}><MenuIcon /> Filters{activeFilterCount ? <span className="filter-count">{activeFilterCount}</span> : null}</button>
        <aside className={`filter-panel ${filtersOpen ? "is-open" : ""}`} id="filter-panel" role={filtersOpen ? "dialog" : undefined} aria-modal={filtersOpen ? true : undefined} aria-labelledby="filter-title"><div className="filter-heading"><h2 id="filter-title">Filter the edit</h2><button ref={closeRef} className="icon-button filter-close" type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)}><CloseIcon /></button></div>
          <FilterContent facets={facets} selectedSlugs={selectedSlugs} maxPrice={maxPrice} onCategoriesChange={(slugs) => updateQuery({ category: slugs.length ? slugs.join(",") : undefined })} onMaxPriceChange={(value) => updateQuery({ max: value < facets.priceRange.max ? String(value) : undefined })} />
          {activeFilterCount ? <button className="filter-clear" type="button" onClick={clearFilters}>Clear all filters</button> : null}
        </aside>
        <div className={`filter-backdrop ${filtersOpen ? "is-open" : ""}`} aria-hidden="true" onClick={() => setFiltersOpen(false)} />
        <div className="catalog-results"><div className="catalog-toolbar"><div><strong>{products.length}</strong><span>{products.length === 1 ? "product" : "products"}{query ? ` for “${query}”` : ""}</span></div><label>Sort by<select value={sort} onChange={(event) => updateQuery({ sort: event.target.value === "featured" ? undefined : event.target.value })}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="rating-desc">Highest rated</option></select></label></div>
          {loadError ? <div className="catalog-empty" role="alert"><p>{loadError}</p></div> : null}
          {products.length ? <div className="product-grid product-grid--catalog" aria-live="polite" aria-busy={loading}>{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : !loading ? <div className="catalog-empty" aria-live="polite"><p className="issue-label">No match / 000</p><h2>Nothing in this edit matches yet.</h2><p>Clear the filters or try a broader product search.</p><button className="button button--dark" type="button" onClick={clearFilters}>Reset catalog</button></div> : null}
        </div>
      </div></section>
    </SiteLayout>
  </>;
}

function FilterContent({ facets, selectedSlugs, maxPrice, onCategoriesChange, onMaxPriceChange }: { facets: CategoryResponse; selectedSlugs: string[]; maxPrice: number; onCategoriesChange: (slugs: string[]) => void; onMaxPriceChange: (value: number) => void }) {
  const toggle = (slug: string, checked: boolean) => onCategoriesChange(checked ? [...selectedSlugs, slug] : selectedSlugs.filter((item) => item !== slug));
  return <div className="filter-content"><fieldset><legend>Category</legend>{facets.items.map((item) => <label key={item.slug}><input type="checkbox" checked={selectedSlugs.includes(item.slug)} onChange={(event) => toggle(item.slug, event.target.checked)} /><span>{item.name as ProductCategory}</span></label>)}</fieldset><fieldset><legend>Maximum price <span>${maxPrice}</span></legend><input aria-label="Maximum price" type="range" min={facets.priceRange.min} max={facets.priceRange.max} step="5" value={maxPrice} onChange={(event) => onMaxPriceChange(Number(event.target.value))} /><div className="range-label"><span>${facets.priceRange.min}</span><span>${facets.priceRange.max}</span></div></fieldset><div className="filter-note">Facets and prices come from the current commerce catalog.</div></div>;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ query: routeQuery }) => {
  try {
    const search = asString(routeQuery.q);
    const category = asString(routeQuery.category);
    const sort = parseSort(routeQuery.sort);
    const rawMaxPrice = Number(asString(routeQuery.max));
    const maxPrice = Number.isFinite(rawMaxPrice) && rawMaxPrice > 0 ? rawMaxPrice : undefined;
    const [products, facets] = await Promise.all([
      listProducts({
        search: search || undefined,
        category: category || undefined,
        sort,
        maxPrice,
        limit: 100,
      }),
      getCategories(),
    ]);
    return { props: { initialProducts: products.items, facets } };
  } catch {
    return { props: { initialProducts: [], facets: { items: [], priceRange: { min: 0, max: 500 } } } };
  }
};
