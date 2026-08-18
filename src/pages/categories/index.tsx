import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SiteHead from "@/components/SiteHead";
import SiteLayout from "@/components/SiteLayout";
import ProductCard from "@/components/ProductCard";
import { CloseIcon, MenuIcon } from "@/components/Icons";
import { categoryProducts } from "@/data/catalog";

export default function Categories() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [feedback, setFeedback] = useState("Filters are shown for preview only in Phase 1.");
  const filterTrigger = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

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

  return (
    <>
      <SiteHead
        title="Casual Clothing | SHOP.CO"
        description="Browse the SHOP.CO casual clothing edit in this Phase 1 catalog preview."
        path="/categories"
      />
      <SiteLayout>
        <section className="category-masthead">
          <div className="container">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Casual</span>
            </nav>
            <p className="issue-label">Catalog / Casual 001</p>
            <h1>
              Casual,
              <br />
              <span>without compromise.</span>
            </h1>
            <div className="catalog-summary">
              <p>{categoryProducts.length} products in this preview</p>
              <p>Static catalog preview</p>
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
              <MenuIcon /> Open filters
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
              <FilterContent onChange={setFeedback} />
            </aside>

            <div
              className={`filter-backdrop ${filtersOpen ? "is-open" : ""}`}
              aria-hidden="true"
              onClick={() => setFiltersOpen(false)}
            />

            <div className="catalog-results">
              <div className="catalog-toolbar">
                <p id="filter-feedback" aria-live="polite">
                  {feedback}
                </p>
                <label>
                  Sort by
                  <select
                    defaultValue="popular"
                    onChange={() => setFeedback("Sorting is a preview and does not reorder products yet.")}
                  >
                    <option value="popular">Most popular</option>
                    <option value="new">Newest</option>
                    <option value="price">Lowest price</option>
                  </select>
                </label>
              </div>

              <div className="product-grid product-grid--catalog">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <nav className="pagination" aria-label="Product pages">
                <button disabled>Previous</button>
                <span>Single-page preview</span>
                <button disabled>Next</button>
              </nav>
            </div>
          </div>
        </section>
      </SiteLayout>
    </>
  );
}

function FilterContent({ onChange }: { onChange: (value: string) => void }) {
  const notify = () => onChange("Filter selected for preview. Results remain unchanged in Phase 1.");

  return (
    <div className="filter-content">
      <fieldset>
        <legend>Category</legend>
        {["T-shirts", "Shirts", "Jeans", "Shorts"].map((item) => (
          <label key={item}>
            <input type="checkbox" onChange={notify} />
            {item}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Price</legend>
        <input
          aria-label="Maximum price"
          type="range"
          min="50"
          max="300"
          defaultValue="250"
          onChange={notify}
        />
        <div className="range-label">
          <span>$50</span>
          <span>$300</span>
        </div>
      </fieldset>

      <fieldset>
        <legend>Colors</legend>
        <div className="swatches">
          {["Black", "Olive", "Navy", "White"].map((color) => (
            <label key={color} className={`swatch swatch--${color.toLowerCase()}`}>
              <input type="radio" name="color-filter" onChange={notify} />
              <span>{color}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Size</legend>
        <div className="filter-sizes">
          {["S", "M", "L", "XL"].map((size) => (
            <label key={size}>
              <input type="checkbox" onChange={notify} />
              <span>{size}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
