import Image from "next/image";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import SiteHead from "@/components/SiteHead";
import SiteLayout from "@/components/SiteLayout";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";
import HeroExperience from "@/components/HeroExperience";
import LogoLoop from "@/components/LogoLoop";
import MagneticLink from "@/components/MagneticLink";
import Reveal from "@/components/Reveal";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import { ArrowIcon } from "@/components/Icons";
import { homeReviews } from "@/data/reviews";
import { listProducts } from "@/lib/api/products";
import type { Product } from "@/types/store";

const brands = ["versace", "zara", "gucci", "prada", "calvin-klein"];
const styles = [
  { name: "Casual", image: "/assets/bbds-Casual.png", className: "style-card--wide" },
  { name: "Formal", image: "/assets/bbds-Formal.png", className: "" },
  { name: "Party", image: "/assets/bbds-Party.png", className: "" },
  { name: "Gym", image: "/assets/bbds-Gym.png", className: "style-card--wide" },
];

type HomeProps = { newArrivals: Product[]; topSelling: Product[] };
export default function Home({ newArrivals, topSelling }: HomeProps) {
  return <>
    <SiteHead title="SHOP.CO | Modern Fashion for Every Style" description="Explore SHOP.CO’s modern edit of casual, formal, party, and active styles." path="/" />
    <SiteLayout>
      <section className="hero"><div className="container hero-grid"><div className="hero-copy">
        <p className="issue-label hero-step">SHOP.CO Journal / Issue 02</p>
        <h1 className="hero-step">Find clothes that match your style.</h1>
        <p className="hero-intro hero-step">A considered edit of expressive everyday pieces—built for the way you move, meet, and make an entrance.</p>
        <MagneticLink href="#new-arrivals" className="button button--dark hero-step">Shop the latest edit <ArrowIcon /></MagneticLink>
        <dl className="hero-stats hero-step"><div><dt>200+</dt><dd>International brands</dd></div><div><dt>2,000+</dt><dd>Quality products</dd></div><div><dt>30,000+</dt><dd>Happy clients</dd></div></dl>
      </div><div className="hero-visual hero-visual--3d hero-step"><HeroExperience /><span className="hero-caption" aria-hidden="true">Digital fashion rack<br />Local garments / 003</span></div></div></section>
      <section className="brand-strip" aria-label="Featured brands"><LogoLoop brands={brands} /></section>
      <ProductSection id="new-arrivals" index="01" label="Latest drop" title="New arrivals" products={newArrivals} />
      <ProductSection id="top-selling" index="02" label="Most selected" title="Top selling" products={topSelling} dark />
      <section id="dress-styles" className="journal-section style-section"><div className="container"><Reveal><SectionHeader index="03" label="The style index" title="Browse by dress style" /><div className="style-grid">{styles.map((style) => <Link className={`style-card ${style.className}`} key={style.name} href="/categories"><Image src={style.image} alt={`${style.name} clothing style`} fill sizes="(max-width: 767px) 100vw, (max-width: 1099px) 50vw, 58vw" /><span>{style.name}</span><ArrowIcon /></Link>)}</div></Reveal></div></section>
      <section className="journal-section reviews-section"><div className="container"><Reveal><SectionHeader index="04" label="Reader notes" title="Our happy customers" /><ReviewsCarousel reviews={homeReviews} /></Reveal></div></section>
    </SiteLayout>
  </>;
}
function ProductSection({ id, index, label, title, products, dark = false }: { id: string; index: string; label: string; title: string; products: Product[]; dark?: boolean }) {
  return <section id={id} className={`journal-section product-section ${dark ? "product-section--dark" : ""}`}><div className="container"><Reveal><SectionHeader index={index} label={label} title={title} /><div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div><Link className="text-link" href="/categories">View the full edit <ArrowIcon /></Link></Reveal></div></section>;
}
export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  try {
    const { items } = await listProducts({ limit: 100 });
    return { props: { newArrivals: items.filter((p) => p.collection === "New arrivals").slice(0, 4), topSelling: items.filter((p) => p.collection === "Top selling").slice(0, 4) } };
  } catch { return { props: { newArrivals: [], topSelling: [] } }; }
};
