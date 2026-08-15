import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "./Icons";
import Newsletter from "./Newsletter";

const navItems = [
  { label: "Shop", href: "/categories" },
  { label: "New arrivals", href: "/#new-arrivals" },
  { label: "Top selling", href: "/#top-selling" },
  { label: "Dress styles", href: "/#dress-styles" },
];

export default function SiteLayout({ children }: { children: ReactNode }) {
  const [promo, setPromo] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = menuButton.current;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
      if (event.key === "Tab") {
        const panel = document.getElementById("mobile-navigation");
        const controls = panel?.querySelectorAll<HTMLElement>('button, a[href]');
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); trigger?.focus(); };
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [router.asPath]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    document.getElementById("search-note")?.focus();
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className={`promo ${promo ? "promo--open" : "promo--closed"}`} aria-hidden={!promo}>
        <p>Sign up and get 20% off your first order. <a href="#newsletter">Sign up now</a></p>
        <button type="button" onClick={() => setPromo(false)} aria-label="Dismiss promotion"><CloseIcon /></button>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <button ref={menuButton} type="button" className="icon-button menu-trigger" aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(true)}><MenuIcon /></button>
          <Link className="brand" href="/" aria-label="SHOP.CO home">SHOP.CO</Link>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map((item) => <Link key={item.label} href={item.href}>{item.label}</Link>)}
          </nav>
          <form className="header-search" role="search" onSubmit={submitSearch}>
            <SearchIcon />
            <label className="sr-only" htmlFor="site-search">Search products</label>
            <input id="site-search" type="search" placeholder="Search the journal" />
            <span id="search-note" className="sr-only" tabIndex={-1}>Search will be available in the next version.</span>
          </form>
          <div className="header-actions">
            <span className="icon-button unavailable" aria-label="Cart — available in the next version"><BagIcon /></span>
            <span className="icon-button unavailable" aria-label="Account — available in a future version"><UserIcon /></span>
          </div>
        </div>
      </header>
      <div className={`mobile-backdrop ${menuOpen ? "is-open" : ""}`} onClick={() => setMenuOpen(false)} aria-hidden="true" />
      <aside id="mobile-navigation" className={`mobile-panel ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <div className="mobile-panel-head"><span>Explore SHOP.CO</span><button ref={closeButton} type="button" className="icon-button" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><CloseIcon /></button></div>
        <nav aria-label="Mobile navigation">{navItems.map((item, index) => <Link key={item.label} href={item.href}><span>0{index + 1}</span>{item.label}</Link>)}</nav>
        <p className="mobile-panel-note">Independent style. One evolving edit.</p>
      </aside>
      <main id="main-content">{children}</main>
      <Newsletter />
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand"><Link className="brand brand--light" href="/">SHOP.CO</Link><p>Clothes that suit your style—and that you’re proud to wear.</p></div>
          <div><h2>Explore</h2><Link href="/categories">Shop the edit</Link><Link href="/#new-arrivals">New arrivals</Link><Link href="/#dress-styles">Dress styles</Link></div>
          <div><h2>Phase one</h2><p>Catalog browsing</p><p>Product preview</p><p>Local interface demos</p></div>
          <div><h2>Coming next</h2><p>Search and filters</p><p>Functional cart</p><p>Customer accounts</p></div>
        </div>
        <div className="container footer-bottom"><p>© {new Date().getFullYear()} SHOP.CO. Demonstration storefront.</p><div className="payment-marks" aria-label="Payment methods planned for a future checkout"><span>VISA</span><span>Mastercard</span><span>PayPal</span></div></div>
      </footer>
    </>
  );
}
