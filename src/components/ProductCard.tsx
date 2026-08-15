import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/store";
import Rating from "./Rating";
import { ArrowIcon } from "./Icons";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link href={product.href} className="product-image" aria-label={`View ${product.name}`}>
        <Image src={product.image} alt={product.name} fill sizes="(max-width: 600px) 72vw, (max-width: 1024px) 40vw, 290px" />
        <span className="product-arrow"><ArrowIcon /></span>
      </Link>
      <div className="product-meta"><Link href={product.href}>{product.name}</Link><Rating value={product.rating} /></div>
      <div className="price-row"><strong>${product.price}</strong>{product.previousPrice && <del>${product.previousPrice}</del>}{product.discount && <span>-{product.discount}%</span>}</div>
    </article>
  );
}
