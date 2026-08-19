import type { Product, ProductVariant } from "../../types/store.ts";

function mapVariant(variant: ProductVariant): ProductVariant {
  return {
    id: variant.id,
    sku: variant.sku,
    ...(variant.color ? { color: { ...variant.color } } : {}),
    ...(variant.size ? { size: variant.size } : {}),
    price: Number(variant.price),
    ...(variant.previousPrice != null ? { previousPrice: Number(variant.previousPrice) } : {}),
    active: Boolean(variant.active),
    availableQuantity: Number(variant.availableQuantity),
  };
}

export function mapApiProduct(input: Product): Product {
  return {
    id: input.id,
    slug: input.slug,
    name: input.name,
    image: input.image,
    price: Number(input.price),
    ...(input.previousPrice != null ? { previousPrice: Number(input.previousPrice) } : {}),
    ...(input.discount != null ? { discount: Number(input.discount) } : {}),
    rating: Number(input.rating),
    category: input.category,
    ...(input.categorySlug ? { categorySlug: input.categorySlug } : {}),
    collection: input.collection,
    href: `/products/${input.slug}`,
    ...(input.description ? { description: input.description } : {}),
    ...(input.gallery ? { gallery: input.gallery.map((image) => ({ src: image.src, alt: image.alt })) } : {}),
    ...(input.colors ? { colors: input.colors.map((color) => ({ ...color })) } : {}),
    ...(input.sizes ? { sizes: [...input.sizes] } : {}),
    ...(input.variants ? { variants: input.variants.map(mapVariant) } : {}),
    ...(input.defaultVariantId ? { defaultVariantId: input.defaultVariantId } : {}),
  };
}
