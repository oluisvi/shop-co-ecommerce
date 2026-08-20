import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import SiteHead, { siteUrl } from "@/components/SiteHead";
import SiteLayout from "@/components/SiteLayout";
import ProductCard from "@/components/ProductCard";
import Rating from "@/components/Rating";
import SectionHeader from "@/components/SectionHeader";
import { productReviews } from "@/data/reviews";
import { useCommerce } from "@/context/CommerceContext";
import { getProduct, listProducts } from "@/lib/api/products";
import { ApiError } from "@/lib/api/client";
import { changeQuantity } from "@/lib/quantity";
import type { Product } from "@/types/store";

type Props = { product: Product; related: Product[] };
export default function ProductDetail({ product, related }: Props) { return <ProductDetailView key={product.id} product={product} related={related} />; }

function ProductDetailView({ product, related }: Props) {
  const { addToCart, openCart } = useCommerce();
  const [image, setImage] = useState(0);
  const [color, setColor] = useState(product.colors?.[0]?.name ?? "");
  const [size, setSize] = useState(product.sizes?.[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const gallery = product.gallery?.length ? product.gallery : [{ src: product.image, alt: product.name }];
  const selectedVariant = useMemo(() => {
    const variants = product.variants ?? [];
    const exact = variants.find((variant) =>
      (!color || variant.color?.name === color) && (!size || variant.size === size),
    );
    return exact ?? variants.find((variant) => variant.id === product.defaultVariantId) ?? variants[0];
  }, [product, color, size]);
  const available = Boolean(selectedVariant?.active && selectedVariant.availableQuantity > 0);
  const sold = product.availability === "SOLD" || !available;
  const maxQuantity = Math.min(9, selectedVariant?.availableQuantity ?? 0);
  const add = () => {
    if (!selectedVariant || !available) return;
    addToCart(selectedVariant.id, Math.min(quantity, maxQuantity), product.name);
    openCart();
  };

  return <>
    <SiteHead title={`${product.name} | SHOP.CO`} description={`${product.name} from the ${product.collection.toLowerCase()} SHOP.CO edit.`} path={product.href} />
    <Head><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org", "@type": "Product", name: product.name,
      image: gallery.map((item) => `${siteUrl}${item.src}`), description: product.description,
      sku: selectedVariant?.sku, brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
      itemCondition: product.condition ? `https://schema.org/${product.condition === "NEW_WITH_TAGS" ? "NewCondition" : "UsedCondition"}` : undefined,
      offers: { "@type": "Offer", url: `${siteUrl}${product.href}`, priceCurrency: "USD", price: selectedVariant?.price ?? product.price,
        availability: sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock" },
    }).replace(/</g, "\\u003c") }} /></Head>
    <SiteLayout>
      <section className="product-page"><div className="container"><nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/categories">Shop</Link><span aria-hidden="true">/</span><span aria-current="page">{product.name}</span></nav>
        <div className="product-detail"><div className={`gallery ${gallery.length === 1 ? "gallery--single" : ""}`}>
          {gallery.length > 1 ? <div className="gallery-thumbs" aria-label="Product images">{gallery.map((item, index) => <button key={item.src} type="button" aria-label={`Show ${item.alt.toLowerCase()}`} aria-pressed={image === index} onClick={() => setImage(index)}><Image src={item.src} alt="" fill sizes="100px" /></button>)}</div> : null}
          <div className="gallery-main"><Image src={gallery[image].src} alt={gallery[image].alt} fill sizes="(max-width: 800px) 100vw, 48vw" /><span className="gallery-index">{String(image + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}</span></div>
        </div>
        <article className="product-information"><p className="issue-label">{product.collection} / {product.category}</p><h1>{product.name}</h1><Rating value={product.rating} /><div className="price-row price-row--large"><strong>${selectedVariant?.price ?? product.price}</strong>{selectedVariant?.previousPrice ? <del>${selectedVariant.previousPrice}</del> : product.previousPrice ? <del>${product.previousPrice}</del> : null}{product.discount ? <span>-{product.discount}%</span> : null}</div>
          <p className="product-description">{product.description ?? `Part of the ${product.collection.toLowerCase()} SHOP.CO edit.`}</p>
          {product.colors?.length ? <fieldset className="option-group"><legend>Select color <span>{color}</span></legend><div className="color-options">{product.colors.map((option) => <button key={option.name} type="button" aria-label={option.name} aria-pressed={color === option.name} style={{ "--swatch": option.value } as CSSProperties} onClick={() => { setColor(option.name); setQuantity(1); }}><span aria-hidden="true" /></button>)}</div></fieldset> : null}
          {product.sizes?.length ? <fieldset className="option-group"><legend>Choose size <span>{size}</span></legend><div className="size-options">{product.sizes.map((option) => <button key={option} type="button" aria-pressed={size === option} onClick={() => { setSize(option); setQuantity(1); }}>{option}</button>)}</div></fieldset> : null}
          {sold ? <div className="sold-panel" role="status"><strong>SOLD / ARCHIVE</strong><p>This one-off piece has found a home. Its page remains as part of the SHOP.CO archive.</p></div> : <><div className="purchase-row"><div className="quantity" aria-label="Quantity"><button type="button" aria-label="Decrease quantity" disabled={quantity === 1} onClick={() => setQuantity((value) => changeQuantity(value, -1))}>−</button><output aria-live="polite" aria-label="Selected quantity">{quantity}</output><button type="button" aria-label="Increase quantity" disabled={quantity >= maxQuantity} onClick={() => setQuantity((value) => Math.min(maxQuantity, changeQuantity(value, 1)))}>+</button></div><button className="button button--dark add-button" type="button" onClick={add}>{`Add ${quantity > 1 ? `${quantity} to` : "to"} bag`}</button></div><p className="inventory-note" aria-live="polite">{product.isOneOfOne ? "One of one — the only piece available" : `${selectedVariant!.availableQuantity} available`}</p></>}
          <dl className="product-facts"><div><dt>Category</dt><dd>{product.category}</dd></div><div><dt>Collection</dt><dd>{product.collection}</dd></div>{product.brand ? <div><dt>Brand</dt><dd>{product.brand}</dd></div> : null}{product.condition ? <div><dt>Condition</dt><dd>{product.condition.replaceAll("_", " ")}</dd></div> : null}{product.material ? <div><dt>Material</dt><dd>{product.material}</dd></div> : null}{product.conditionNotes ? <div><dt>Condition notes</dt><dd>{product.conditionNotes}</dd></div> : null}{product.imperfections ? <div><dt>Imperfections</dt><dd>{product.imperfections}</dd></div> : null}{product.measurements ? Object.entries(product.measurements).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>) : null}<div><dt>Product code</dt><dd>{selectedVariant?.sku ?? product.id}</dd></div></dl>
        </article></div>
      </div></section>
      {product.id === "one-life" ? <section className="journal-section product-reviews"><div className="container"><SectionHeader index="01" label="Wearer notes" title="Ratings & reviews" /><div className="reviews-grid reviews-grid--product">{productReviews.map((review) => <article className="review-card" key={review.id}><Rating value={review.rating} /><blockquote>“{review.quote}”</blockquote><footer><div><strong>{review.author}</strong><span>Verified customer</span></div><time>{review.date}</time></footer></article>)}</div></div></section> : null}
      <section className="journal-section recommendations"><div className="container"><SectionHeader index={product.id === "one-life" ? "02" : "01"} label="Continue the edit" title="You might also like" /><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></div></section>
    </SiteLayout>
  </>;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const slug = typeof params?.slug === "string" ? params.slug : "";
  try {
    const [product, catalog] = await Promise.all([getProduct(slug), listProducts({ limit: 100 })]);
    const related = catalog.items.filter((item) => item.id !== product.id && (item.category === product.category || item.collection === "Recommended")).slice(0, 4);
    return { props: { product, related } };
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) return { notFound: true };
    throw error;
  }
};
