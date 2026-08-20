import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/types/store";
import { useCommerce } from "@/context/CommerceContext";
import Rating from "./Rating";
import { ArrowIcon, BagIcon } from "./Icons";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCommerce();
  const [added, setAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const variantId = product.defaultVariantId ?? product.variants?.find((variant) => variant.active && variant.availableQuantity > 0)?.id;
  const sold = product.availability === "SOLD" || !variantId;

  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);
  const add = () => {
    if (!variantId) return;
    addToCart(variantId, 1, product.name);
    setAdded(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="product-card">
      <Link href={product.href} className="product-image" aria-label={`View ${product.name}`}>
        <Image src={product.image} alt={product.name} fill sizes="(max-width: 600px) 72vw, (max-width: 1024px) 40vw, 290px" />
        {sold ? <span className="archive-badge">SOLD</span> : product.isOneOfOne ? <span className="archive-badge">1 OF 1</span> : null}
        <span className="product-arrow"><ArrowIcon /></span>
      </Link>
      <div className="product-meta"><Link href={product.href}>{product.name}</Link><Rating value={product.rating} /></div>
      <div className="product-card__footer">
        <div className="price-row">
          <strong>${product.price}</strong>
          {product.previousPrice ? <del>${product.previousPrice}</del> : null}
          {product.discount ? <span>-{product.discount}%</span> : null}
        </div>
        {variantId ? <button type="button" className={`quick-add ${added ? "is-added" : ""}`} onClick={add}
          aria-label={`${added ? "Added" : "Add"} ${product.name} to bag`}>
          <BagIcon /><span>{added ? "Added" : "Add"}</span>
        </button> : <span className="archive-status" aria-label={`${product.name} is sold`}>Archive piece</span>}
      </div>
    </article>
  );
}
