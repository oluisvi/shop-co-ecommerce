import MagneticLink from "./MagneticLink";

const exploreLinks = [
  { label: "Shop the edit", href: "/categories" },
  { label: "New arrivals", href: "/#new-arrivals" },
  { label: "Top selling", href: "/#top-selling" },
  { label: "Dress styles", href: "/#dress-styles" },
];

const journalLinks = [
  { label: "Customer notes", href: "/#reviews" },
  { label: "Newsletter", href: "/#newsletter" },
  { label: "Home", href: "/" },
];

export default function Footer() {
  return (
    <footer className="site-footer site-footer--editorial">
      <div className="container footer-editorial__topline">
        <p>SHOP.CO / DIGITAL FASHION STOREFRONT</p>
        <p>SELECTED ESSENTIALS / GLOBAL</p>
      </div>

      <div className="container footer-editorial__wordmark-wrap">
        <MagneticLink href="/" className="footer-editorial__wordmark">
          SHOP.CO
        </MagneticLink>
        <p className="footer-editorial__statement">
          Clothing, motion and commerce shaped into one editorial storefront.
        </p>
      </div>

      <div className="container footer-editorial__grid">
        <nav className="footer-editorial__column" aria-label="Explore SHOP.CO">
          <p className="footer-editorial__label">Explore</p>
          {exploreLinks.map((item) => (
            <MagneticLink key={item.href} href={item.href}>
              {item.label}
            </MagneticLink>
          ))}
        </nav>

        <nav className="footer-editorial__column" aria-label="SHOP.CO journal links">
          <p className="footer-editorial__label">Journal</p>
          {journalLinks.map((item) => (
            <MagneticLink key={item.href} href={item.href}>
              {item.label}
            </MagneticLink>
          ))}
        </nav>

        <div className="footer-editorial__column footer-editorial__status">
          <p className="footer-editorial__label">Store status</p>
          <p>Search + filters online</p>
          <p>Persistent shopping bag</p>
          <p>Secure Stripe checkout online</p>
        </div>

        <div className="footer-editorial__column footer-editorial__note">
          <p className="footer-editorial__label">Built as</p>
          <p>
            A portfolio-grade fashion commerce concept focused on interaction,
            accessibility and visual direction.
          </p>
        </div>
      </div>

      <div className="container footer-editorial__bottom">
        <p>© {new Date().getFullYear()} SHOP.CO. Portfolio demonstration storefront.</p>
        <p>3D fashion figure: Tiko · CC BY 4.0</p>
      </div>
    </footer>
  );
}
