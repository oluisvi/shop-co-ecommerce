export type OneOffVariantInput = Readonly<{
  productId: string;
  slug: string;
  priceCents: number;
}>;

export function normalizeThriftText(value: string, maxLength: number) {
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) throw new Error('INVALID_TEXT');
  return normalized;
}

export function createOneOffVariant(input: OneOffVariantInput) {
  if (!Number.isSafeInteger(input.priceCents) || input.priceCents <= 0) {
    throw new Error('INVALID_PRICE');
  }
  const skuStem = input.slug
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (!skuStem) throw new Error('INVALID_SLUG');
  return {
    id: `${input.productId}-default`,
    sku: `${skuStem}-ONE`,
    size: 'ONE SIZE',
    priceCents: input.priceCents,
    quantity: 1,
    active: true,
  } as const;
}
