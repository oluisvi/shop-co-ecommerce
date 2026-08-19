import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import SiteHead from "@/components/SiteHead";
import SiteLayout from "@/components/SiteLayout";
import ProductCard from "@/components/ProductCard";
import { CloseIcon, MenuIcon } from "@/components/Icons";
import { allProducts } from "@/data/catalog";
import {
  CatalogSort,
  deriveCategoryFacets,
  filterProducts,
  getCatalogMaxPrice,
  sortProducts,
} from "@/lib/catalog";
import type { ProductCategory } from "@/types/store";

const facets = deriveCategoryFacets(allProducts);
const catalogMaxPrice = getCatalogMaxPrice(allProducts);
const catalogMinPrice = Math.min(...allProducts.map((product) => product.price));

function asString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parseCategories(value: string | string[] | undefined) {
  const raw = asString(value);
  if (!raw) return [] as ProductCategory[];

  return raw
    .split(",")
    .filter((category): category is ProductCategory =>
      facets.includes(category as ProductCategory),
    );
}

function parseSort(value: string | string[] | undefined): CatalogSort {
  const raw = asString(value);
  if (
    raw === "price-asc" ||
    raw === "price-desc" ||
    raw === "rating-desc" ||
    raw === "featured"
  ) {
    return raw;
  }
  return "featured";
}

function parseMaxPrice(value: string | string[] | undefined) {
  const parsed = Number(asString(value));
  if (!Number.isFinite(parsed) || parsed <= 0) return catalogMaxPrice;
  return Math.min(catalogMaxPrice, Math.max(catalogMinPrice, Math.round(parsed)));
}

export default function Categories() {
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterTrigger = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const query = asString(router.query.q);
  const selectedCategories = parseCategories(router.query.category);
  const maxPrice = parseMaxPrice(router.query.max);
  const sort = parseSort(router.query.sort);

  const visibleProducts = sortProducts(
    filterProducts(allProducts, {
      query,
      categories: selectedCategories,
      maxPrice,
    }),
    sort,
  );

  const updateQuery = (
    patch: Record<string, string | undefined>,
  ) => {
    const next: Record<string, string> = {};

    for (const [key, value] of Object.entries(router.query)) {
      const normalized = asString(value);
      if (normalized) next[key] = normalized;
    }

    for (const [key, value] of Object.entries(patch)) {
      if (value) next[key] = value;
      else delete next[key];
    }

    void router.replace(
      { pathname: "/categories", query: next },
      undefined,
      { shallow: true, scroll: false },
    );
  };

  const clearFilters = () => {
    updateQuery({ q: undefined, category: undefined, max: undefined, sort: undefined });
  };

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1100px)");
    const syncLayout = () => {
      if (desktop.matches) setFiltersOpen(false);
    };

    syncLayout();
    desktop.addEventListener("change", syncLayout);
    return () => desktop.removeEventListener("change", syncLayout);
  }, []);

  useEffect(() => {
    if (!filtersOpen) return;

    const previousOverflow = document.body.style.overflow;
    const trigger = filterTrigger.current;
    const panel = document.getElementById("filter-panel");

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setFiltersOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const controls = panel?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!controls?.length) return;

      const first = controls[0];
      const last = controls[controls.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [filtersOpen]);

  const activeFilterCount =
    selectedCategories.length +
    (maxPrice < catalogMaxPrice ? 1 : 0) +
    (query ? 1 : 0);

  return (
    <>
      <SiteHead
        title="Fashion Catalog | SHOP.CO"
        description="Search, filter and sort the SHOP.CO fashion edit."
        path="/categories"
      />
      <SiteLayout>
        <section className="category-masthead">
          <div className="container">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Shop</span>
            </nav>
            <p className="issue-label">Catalog / Full edit</p>
            <h1>
              Find your
              <br />
              <span>next piece.</span>
            </h1>
            <div className="catalog-summary">
              <p>{allProducts.length} products in the local catalog</p>
              <p>Search · filter · sort</p>
            </div>
          </div>
        </section>

        <section className="catalog-section">
          <div className="container catalog-layout">
            <button
              ref={filterTrigger}
              className="button filter-trigger"
              type="button"
              aria-expanded={filtersOpen}
              aria-controls="filter-panel"
              onClick={() => setFiltersOpen(true)}
            >
              <MenuIcon /> Filters
              {activeFilterCount ? <span className="filter-count">{activeFilterCount}</span> : null}
            </button>

            <aside
              className={`filter-panel ${filtersOpen ? "is-open" : ""}`}
              id="filter-panel"
              role={filtersOpen ? "dialog" : undefined}
              aria-modal={filtersOpen ? true : undefined}
              aria-labelledby="filter-title"
            >
              <div className="filter-heading">
                <h2 id="filter-title">Filter the edit</h2>
                <button
                  ref={closeRef}
                  className="icon-button filter-close"
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setFiltersOpen(false)}
                >
                  <CloseIcon />
                </button>
              </div>

              <FilterContent
                selectedCategories={selectedCategories}
                maxPrice={maxPrice}
                onCategoriesChange={(categories) =>
                  updateQuery({
                    category: categories.length ? categories.join(",") : undefined,
                  })
                }
                onMaxPriceChange={(value) =>
                  updateQuery({
                    max: value < catalogMaxPrice ? String(value) : undefined,
                  })
                }
              />

              {activeFilterCount ? (
                <button className="filter-clear" type="button" onClick={clearFilters}>
                  Clear all filters
                </button>
              ) : null}
            </aside>

            <div
              className={`filter-backdrop ${filtersOpen ? "is-open" : ""}`}
              aria-hidden="true"
              onClick={() => setFiltersOpen(false)}
            />

            <div className="catalog-results">
              <div className="catalog-toolbar">
                <div>
                  <strong>{visibleProducts.length}</strong>
                  <span>
                    {visibleProducts.length === 1 ? "product" : "products"}
                    {query ? ` for “${query}”` : ""}
                  </span>
                </div>
                <label>
                  Sort by
                  <select
                    value={sort}
                    onChange={(event) =>
                      updateQuery({
                        sort:
                          event.target.value === "featured"
                            ? undefined
                            : event.target.value,
                      })
                    }
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                    <option value="rating-desc">Highest rated</option>
                  </select>
                </label>
              </div>

              {visibleProducts.length ? (
                <div className="product-grid product-grid--catalog" aria-live="polite">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="catalog-empty" aria-live="polite">
                  <p className="issue-label">No match / 000</p>
                  <h2>Nothing in this edit matches yet.</h2>
                  <p>Clear the filters or try a broader product search.</p>
                  <button className="button button--dark" type="button" onClick={clearFilters}>
                    Reset catalog
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </SiteLayout>
    </>
  );
}

function FilterContent({
  selectedCategories,
  maxPrice,
  onCategoriesChange,
  onMaxPriceChange,
}: {
  selectedCategories: ProductCategory[];
  maxPrice: number;
  onCategoriesChange: (categories: ProductCategory[]) => void;
  onMaxPriceChange: (value: number) => void;
}) {
  const toggleCategory = (category: ProductCategory, checked: boolean) => {
    const next = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter((item) => item !== category);
    onCategoriesChange(next);
  };

  return (
    <div className="filter-content">
      <fieldset>
        <legend>Category</legend>
        {facets.map((item) => (
          <label key={item}>
            <input
              type="checkbox"
              checked={selectedCategories.includes(item)}
              onChange={(event) => toggleCategory(item, event.target.checked)}
            />
            <span>{item}</span>
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>
          Maximum price <span>${maxPrice}</span>
        </legend>
        <input
          aria-label="Maximum price"
          type="range"
          min={catalogMinPrice}
          max={catalogMaxPrice}
          step="5"
          value={maxPrice}
          onChange={(event) => onMaxPriceChange(Number(event.target.value))}
        />
        <div className="range-label">
          <span>${catalogMinPrice}</span>
          <span>${catalogMaxPrice}</span>
        </div>
      </fieldset>

      <div className="filter-note">
        Facets are derived from the products that actually exist in the local catalog.
      </div>
    </div>
  );
}
