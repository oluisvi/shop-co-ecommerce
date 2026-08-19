import Image from "next/image";
import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { listProducts } from "@/lib/api/products";
import { useCommerce } from "@/context/CommerceContext";
import type { Product } from "@/types/store";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "./Icons";
import Newsletter from "./Newsletter";
import Footer from "./Footer";

const navItems = [
  { label: "Shop", href: "/categories" },
  { label: "New arrivals", href: "/#new-arrivals" },
  { label: "Top selling", href: "/#top-selling" },
  { label: "Dress styles", href: "/#dress-styles" },
];

export default function SiteLayout({ children }: { children: ReactNode }) {
  const [promo, setPromo] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuCloseButton = useRef<HTMLButtonElement>(null);
  const cartButton = useRef<HTMLButtonElement>(null);
  const cartCloseButton = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const {
    cart, cartDetails, cartIssues, cartCount, subtotal, reconciling, cartOpen, announcement,
    setQuantity, removeFromCart, clearCart, refreshCart, openCart, closeCart,
  } = useCommerce();

  useEffect(() => {
    const query = search.trim();
    if (!query) { setSearchResults([]); return; }
    let alive = true;
    const timer = window.setTimeout(() => {
      void listProducts({ search: query, limit: 5 })
        .then((result) => { if (alive) setSearchResults(result.items); })
        .catch(() => { if (alive) setSearchResults([]); });
    }, 180);
    return () => { alive = false; window.clearTimeout(timer); };
  }, [search]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = menuButton.current;
    document.body.style.overflow = "hidden";
    menuCloseButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setMenuOpen(false); return; }
      if (event.key !== "Tab") return;
      const panel = document.getElementById("mobile-navigation");
      const controls = panel?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
      if (!controls?.length) return;
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); trigger?.focus(); };
  }, [menuOpen]);

  useEffect(() => {
    if (!cartOpen) return;
    setMenuOpen(false);
    const previousOverflow = document.body.style.overflow;
    const trigger = cartButton.current;
    document.body.style.overflow = "hidden";
    cartCloseButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeCart(); return; }
      if (event.key !== "Tab") return;
      const panel = document.getElementById("cart-drawer");
      const controls = panel?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!controls?.length) return;
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); trigger?.focus(); };
  }, [cartOpen, closeCart]);

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [router.asPath]);
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    setSearchOpen(false);
    void router.push({ pathname: "/categories", query: query ? { q: query } : {} });
  };

  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    {promo ? (
      <div className="promo"><p>SHOP.CO Phase 3 — live catalog, inventory and orders are connected. <Link href="/categories">Explore the edit</Link></p><button type="button" onClick={() => setPromo(false)} aria-label="Dismiss promotion"><CloseIcon /></button></div>
    ) : null}
    <header className="site-header"><div className="container header-inner">
      <button ref={menuButton} type="button" className="icon-button menu-trigger" aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(true)}><MenuIcon /></button>
      <Link className="brand" href="/" aria-label="SHOP.CO home">SHOP.CO</Link>
      <nav className="desktop-nav" aria-label="Primary navigation">{navItems.map((item) => <Link key={item.label} href={item.href}>{item.label}</Link>)}</nav>
      <form className="header-search" role="search" aria-label="Product search" onSubmit={submitSearch} onFocus={() => setSearchOpen(true)} onBlur={(event) => { const next = event.relatedTarget; if (!(next instanceof Node) || !event.currentTarget.contains(next)) setSearchOpen(false); }}>
        <SearchIcon /><label className="sr-only" htmlFor="site-search">Search products</label>
        <input id="site-search" type="search" value={search} placeholder="Search the edit" autoComplete="off" onChange={(event) => { setSearch(event.target.value); setSearchOpen(true); }} onKeyDown={(event) => { if (event.key === "Escape") setSearchOpen(false); }} />
        <button className="search-submit" type="submit">Search</button>
        {searchOpen && search.trim() ? <div className="search-popover" id="search-suggestions"><div className="search-popover__head"><span>{searchResults.length ? "Quick results" : "No match yet"}</span><Link href={{ pathname: "/categories", query: { q: search.trim() } }}>See catalog</Link></div>{searchResults.length ? <ul>{searchResults.map((product) => <li key={product.id}><Link href={product.href}><Image src={product.image} alt="" width={54} height={64} /><span><strong>{product.name}</strong><small>{product.category} · ${product.price}</small></span></Link></li>)}</ul> : <p>Try a product type such as T-shirt, jeans, shirt, shorts or polo.</p>}</div> : null}
      </form>
      <div className="header-actions"><button ref={cartButton} className="icon-button cart-trigger" type="button" aria-label={`Open shopping bag${cartCount ? `, ${cartCount} items` : ""}`} aria-expanded={cartOpen} aria-controls="cart-drawer" onClick={openCart}><BagIcon />{cartCount ? <span className="cart-badge">{cartCount}</span> : null}</button><span className="icon-button unavailable" aria-label="Account — planned for Phase 4"><UserIcon /></span></div>
    </div></header>

    <div className={`mobile-backdrop ${menuOpen ? "is-open" : ""}`} onClick={() => setMenuOpen(false)} aria-hidden="true" />
    <aside id="mobile-navigation" className={`mobile-panel ${menuOpen ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Site navigation" aria-hidden={!menuOpen}><div className="mobile-panel-head"><span>Explore SHOP.CO</span><button ref={menuCloseButton} type="button" className="icon-button" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><CloseIcon /></button></div><nav aria-label="Mobile navigation">{navItems.map((item, index) => <Link key={item.label} href={item.href}><span>0{index + 1}</span>{item.label}</Link>)}</nav><p className="mobile-panel-note">Independent style. One evolving edit.</p></aside>

    <div className={`cart-backdrop ${cartOpen ? "is-open" : ""}`} aria-hidden="true" onClick={closeCart} />
    <aside id="cart-drawer" className={`cart-drawer ${cartOpen ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-hidden={!cartOpen}>
      <div className="cart-drawer__head"><div><p>Live bag</p><h2 id="cart-title">Your edit</h2></div><button ref={cartCloseButton} type="button" className="icon-button" aria-label="Close shopping bag" onClick={closeCart}><CloseIcon /></button></div>
      {cart.length ? <>
        {cartIssues.length ? <div className="cart-alert" role="status">{cartIssues.map((issue, index) => <p key={`${issue.variantId}-${index}`}>{issue.message}</p>)}{cartIssues.some((issue) => issue.type === "API_UNAVAILABLE") ? <button className="cart-retry" type="button" onClick={() => void refreshCart()}>Retry bag check</button> : null}</div> : null}
        <div className="cart-lines" aria-busy={reconciling}>{cartDetails.map((detail) => {
          const line = cart.find((item) => item.variantId === detail.variantId);
          if (!line) return null;
          return <article className="cart-line" key={detail.variantId}><Link href={detail.product.href} onClick={closeCart}><Image src={detail.product.image} alt="" width={92} height={112} /></Link><div className="cart-line__copy"><Link href={detail.product.href} onClick={closeCart}>{detail.product.name}</Link><span>{[detail.variant.color?.name, detail.variant.size].filter(Boolean).join(" / ") || "Default"}</span><span>${detail.variant.price}</span><div className="cart-line__actions"><div className="mini-quantity" aria-label={`Quantity for ${detail.product.name}`}><button type="button" aria-label={`Decrease ${detail.product.name} quantity`} disabled={line.quantity === 1} onClick={() => setQuantity(detail.variantId, line.quantity - 1)}>−</button><output aria-live="polite">{line.quantity}</output><button type="button" aria-label={`Increase ${detail.product.name} quantity`} disabled={line.quantity === 9 || line.quantity >= detail.availableQuantity} onClick={() => setQuantity(detail.variantId, line.quantity + 1)}>+</button></div><button className="cart-remove" type="button" onClick={() => removeFromCart(detail.variantId)}>Remove</button></div></div></article>;
        })}{cartIssues.filter((issue) => issue.variantId !== "cart" && !cartDetails.some((detail) => detail.variantId === issue.variantId)).map((issue) => <article className="cart-line cart-line--unavailable" key={`unavailable-${issue.variantId}`}><div className="cart-line__copy"><strong>Unavailable item</strong><span>{issue.message}</span><button className="cart-remove" type="button" onClick={() => removeFromCart(issue.variantId)}>Remove</button></div></article>)}</div>
        <div className="cart-summary"><div><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div><Link className={`button button--dark demo-checkout ${cartIssues.length ? "is-disabled" : ""}`} href={cartIssues.length ? "/categories" : "/checkout"} onClick={closeCart}>{cartIssues.length ? "Resolve bag issues" : "Checkout"}</Link><button className="cart-clear" type="button" onClick={clearCart}>Clear bag</button><p>Final price and inventory are verified by the commerce API before the order is created.</p></div>
      </> : <div className="cart-empty"><p className="issue-label">Bag / 000</p><h3>Your bag is waiting.</h3><p>Add a piece from the catalog and it will persist locally on this device.</p><Link className="button button--dark" href="/categories" onClick={closeCart}>Explore products</Link></div>}
    </aside>
    <p className="sr-only" aria-live="polite">{announcement}</p>
    <main id="main-content">{children}</main><Newsletter /><Footer />
  </>;
}
