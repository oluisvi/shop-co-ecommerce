type Decimalish = number | string | { toString(): string };

type ProductRecord = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: string;
  collection: string;
  cardImage: string;
  rating: Decimalish;
  brand?: string | null;
  condition?: string | null;
  conditionNotes?: string | null;
  material?: string | null;
  measurements?: unknown;
  imperfections?: string | null;
  soldAt?: Date | null;
  category: { slug: string; name: string };
  images: { url: string; alt: string; position: number }[];
  variants: {
    id: string;
    sku: string;
    color: string | null;
    colorValue: string | null;
    size: string | null;
    price: Decimalish;
    compareAtPrice: Decimalish | null;
    active: boolean;
    inventory: { quantity: number; reservedQuantity: number } | null;
  }[];
};

function numberOf(value: Decimalish | null | undefined) {
  if (value == null) return undefined;
  return Number(typeof value === "object" ? value.toString() : value);
}

export function availableQuantity(inventory: { quantity: number; reservedQuantity: number } | null) {
  if (!inventory) return 0;
  return Math.max(0, inventory.quantity - inventory.reservedQuantity);
}

export function presentProduct(product: ProductRecord) {
  const variants = product.variants.map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    color: variant.color ? { name: variant.color, value: variant.colorValue ?? "#000000" } : undefined,
    size: variant.size ?? undefined,
    price: numberOf(variant.price) ?? 0,
    previousPrice: numberOf(variant.compareAtPrice),
    active: variant.active,
    availableQuantity: availableQuantity(variant.inventory),
  }));
  const sellable = variants.find((variant) => variant.active && variant.availableQuantity > 0);
  const displayVariant = sellable ?? variants.find((variant) => variant.active) ?? variants[0];
  const price = displayVariant?.price ?? 0;
  const previousPrice = displayVariant?.previousPrice;
  const discount = previousPrice && previousPrice > price
    ? Math.round(((previousPrice - price) / previousPrice) * 100)
    : undefined;
  const colors = Array.from(
    new Map(variants.filter((variant) => variant.color).map((variant) => [variant.color!.name, variant.color!])).values(),
  );
  const sizes = Array.from(new Set(variants.map((variant) => variant.size).filter((value): value is string => Boolean(value))));
  const gallery = [...product.images]
    .sort((a, b) => a.position - b.position)
    .map((image) => ({ src: image.url, alt: image.alt }));
  const totalAvailable = variants.reduce((total, variant) => total + (variant.active ? variant.availableQuantity : 0), 0);
  const totalPhysical = product.variants.reduce((total, variant) => total + (variant.inventory?.quantity ?? 0), 0);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    image: product.cardImage,
    price,
    previousPrice,
    discount,
    rating: numberOf(product.rating) ?? 0,
    category: product.category.name,
    categorySlug: product.category.slug,
    collection: product.collection,
    href: `/products/${product.slug}`,
    description: product.description ?? undefined,
    gallery,
    colors,
    sizes,
    variants,
    defaultVariantId: sellable?.id ?? null,
    availability: totalAvailable > 0 ? "AVAILABLE" as const : "SOLD" as const,
    isOneOfOne: totalPhysical <= 1,
    soldAt: product.soldAt?.toISOString(),
    brand: product.brand ?? undefined,
    condition: product.condition ?? undefined,
    conditionNotes: product.conditionNotes ?? undefined,
    material: product.material ?? undefined,
    measurements: product.measurements ?? undefined,
    imperfections: product.imperfections ?? undefined,
  };
}

export type PresentedProduct = ReturnType<typeof presentProduct>;
