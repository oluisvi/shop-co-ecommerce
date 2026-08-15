import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import SiteHead from "@/components/SiteHead";
import SiteLayout from "@/components/SiteLayout";
import Rating from "@/components/Rating";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";
import { productReviews } from "@/data/reviews";
import { recommendations } from "@/data/catalog";

const gallery = [
  { src: "/assets/one-life-shirt-front.png", alt: "Front view of One Life Graphic T-shirt" },
  { src: "/assets/one-life-shirt-back.png", alt: "Back view of One Life Graphic T-shirt" },
  { src: "/assets/one-life-shirt-model.png", alt: "Model wearing One Life Graphic T-shirt" },
];
const colors = [{ name: "Olive", value: "#4f4631" }, { name: "Forest", value: "#263d31" }, { name: "Navy", value: "#30354c" }];

export default function Products() {
  const [image, setImage] = useState(0);
  const [color, setColor] = useState("Olive");
  const [size, setSize] = useState("Large");
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");
  return <>
    <SiteHead title="One Life Graphic T-Shirt | SHOP.CO" description="Preview the One Life Graphic T-shirt, its available style options, and customer reviews." path="/products" />
    <SiteLayout>
      <section className="product-page"><div className="container"><nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/categories">Shop</Link><span>/</span><span aria-current="page">One Life Graphic T-shirt</span></nav><div className="product-detail">
        <div className="gallery"><div className="gallery-thumbs" aria-label="Product images">{gallery.map((item, index) => <button key={item.src} type="button" aria-label={`Show ${item.alt.toLowerCase()}`} aria-pressed={image === index} onClick={() => setImage(index)}><Image src={item.src} alt="" fill sizes="100px" /></button>)}</div><div className="gallery-main"><Image src={gallery[image].src} alt={gallery[image].alt} fill priority sizes="(max-width: 800px) 100vw, 48vw" /></div></div>
        <article className="product-information"><p className="issue-label">Product file / 001</p><h1>One Life Graphic T-shirt</h1><Rating value={4.5} /><div className="price-row price-row--large"><strong>$220</strong><del>$260</del><span>-40%</span></div><p className="product-description">A graphic T-shirt made for everyday expression. Its soft, breathable feel balances a bold print with an easy silhouette.</p>
          <fieldset className="option-group"><legend>Select color <span>{color}</span></legend><div className="color-options">{colors.map((option) => <button key={option.name} type="button" aria-label={option.name} aria-pressed={color === option.name} style={{ "--swatch": option.value } as React.CSSProperties} onClick={() => setColor(option.name)}><span /></button>)}</div></fieldset>
          <fieldset className="option-group"><legend>Choose size <span>{size}</span></legend><div className="size-options">{["Small", "Medium", "Large", "X-Large"].map((option) => <button key={option} type="button" aria-pressed={size === option} onClick={() => setSize(option)}>{option}</button>)}</div></fieldset>
          <div className="purchase-row"><div className="quantity" aria-label="Quantity"><button type="button" aria-label="Decrease quantity" disabled={quantity === 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><output aria-live="polite">{quantity}</output><button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(9, value + 1))}>+</button></div><button className="button button--dark add-button" type="button" onClick={() => setNotice("Cart functionality will be available in the next version.")}>Add to cart</button></div><p className="cart-notice" aria-live="polite">{notice}</p>
          <dl className="product-facts"><div><dt>Fit</dt><dd>Regular</dd></div><div><dt>Style</dt><dd>Graphic</dd></div><div><dt>Phase</dt><dd>Preview only</dd></div></dl>
        </article>
      </div></div></section>
      <section className="journal-section product-reviews"><div className="container"><SectionHeader index="01" label="Wearer notes" title="Ratings & reviews" /><div className="reviews-grid reviews-grid--product">{productReviews.map((review) => <article className="review-card" key={review.id}><Rating value={review.rating} /><blockquote>“{review.quote}”</blockquote><footer><div><strong>{review.author}</strong><span>Verified customer</span></div><time>{review.date}</time></footer></article>)}</div></div></section>
      <section className="journal-section recommendations"><div className="container"><SectionHeader index="02" label="Continue the edit" title="You might also like" /><div className="product-grid">{recommendations.map((product) => <ProductCard key={product.id} product={product} />)}</div></div></section>
    </SiteLayout>
  </>;
}
