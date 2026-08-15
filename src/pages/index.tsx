import Image from "next/image";
import Link from "next/link";
import SiteHead from "@/components/SiteHead";
import SiteLayout from "@/components/SiteLayout";
import ProductCard from "@/components/ProductCard";
import Rating from "@/components/Rating";
import SectionHeader from "@/components/SectionHeader";
import { ArrowIcon } from "@/components/Icons";
import { newArrivals, topSelling } from "@/data/catalog";
import { homeReviews } from "@/data/reviews";

const brands = ["versace", "zara", "gucci", "prada", "calvin-klein"];
const styles = [
  { name: "Casual", image: "/assets/bbds-Casual.png", className: "style-card--wide" },
  { name: "Formal", image: "/assets/bbds-Formal.png", className: "" },
  { name: "Party", image: "/assets/bbds-Party.png", className: "" },
  { name: "Gym", image: "/assets/bbds-Gym.png", className: "style-card--wide" },
];

export default function Home() {
  return (
    <>
      <SiteHead title="SHOP.CO | Modern Fashion for Every Style" description="Explore SHOP.CO’s modern edit of casual, formal, party, and active styles." path="/" />
      <SiteLayout>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="issue-label hero-step">SHOP.CO Journal / Issue 01</p>
              <h1 className="hero-step">Find clothes that match your style.</h1>
              <p className="hero-intro hero-step">A considered edit of expressive everyday pieces—built for the way you move, meet, and make an entrance.</p>
              <Link href="#new-arrivals" className="button button--dark hero-step">Shop the latest edit <ArrowIcon /></Link>
              <dl className="hero-stats hero-step">
                <div><dt>200+</dt><dd>International brands</dd></div>
                <div><dt>2,000+</dt><dd>Quality products</dd></div>
                <div><dt>30,000+</dt><dd>Happy clients</dd></div>
              </dl>
            </div>
            <div className="hero-visual hero-step">
              <Image src="/assets/main-couple.png" alt="Two models wearing contemporary SHOP.CO outfits" fill priority sizes="(max-width: 767px) 100vw, 52vw" />
              <span className="hero-caption">Street / Formal<br />Everyday / Yours</span>
              <span className="hero-star hero-star--one" aria-hidden="true">✦</span><span className="hero-star hero-star--two" aria-hidden="true">✦</span>
            </div>
          </div>
        </section>
        <section className="brand-strip" aria-label="Featured brands"><div className="container brand-list">{brands.map((brand) => <Image key={brand} src={`/assets/${brand}.svg`} alt={brand === "calvin-klein" ? "Calvin Klein" : brand[0].toUpperCase() + brand.slice(1)} width={150} height={42} />)}</div></section>
        <ProductSection id="new-arrivals" index="01" label="Latest drop" title="New arrivals" products={newArrivals} />
        <ProductSection id="top-selling" index="02" label="Most selected" title="Top selling" products={topSelling} dark />
        <section id="dress-styles" className="journal-section style-section">
          <div className="container"><SectionHeader index="03" label="The style index" title="Browse by dress style" /><div className="style-grid">{styles.map((style) => <Link className={`style-card ${style.className}`} key={style.name} href="/categories"><Image src={style.image} alt={`${style.name} clothing style`} fill sizes="(max-width: 700px) 100vw, 50vw" /><span>{style.name}</span><ArrowIcon /></Link>)}</div></div>
        </section>
        <section className="journal-section reviews-section">
          <div className="container"><SectionHeader index="04" label="Reader notes" title="Our happy customers" /><div className="reviews-grid">{homeReviews.map((review) => <article className="review-card" key={review.id}><Rating value={review.rating} /><blockquote>“{review.quote}”</blockquote><footer><strong>{review.author}</strong><span>Verified customer</span></footer></article>)}</div></div>
        </section>
      </SiteLayout>
    </>
  );
}

function ProductSection({ id, index, label, title, products, dark = false }: { id: string; index: string; label: string; title: string; products: typeof newArrivals; dark?: boolean }) {
  return <section id={id} className={`journal-section product-section ${dark ? "product-section--dark" : ""}`}><div className="container"><SectionHeader index={index} label={label} title={title} /><div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div><Link className="text-link" href="/categories">View the full edit <ArrowIcon /></Link></div></section>;
}
