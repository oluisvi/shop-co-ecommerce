type EditableProduct = { name: string; price: string; published: boolean };

export function getNextFulfillmentStatus(status: string): 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | null {
  if (status === 'PAID') return 'PROCESSING';
  if (status === 'PROCESSING') return 'SHIPPED';
  if (status === 'SHIPPED') return 'DELIVERED';
  return null;
}

export function buildStudioProductUpdate(input: EditableProduct) {
  const priceCents = Math.round(Number(input.price) * 100);
  if (!Number.isSafeInteger(priceCents) || priceCents < 1 || priceCents > 10_000_000) {
    throw new Error('INVALID_PRICE');
  }
  const name = input.name.trim();
  if (!name) throw new Error('INVALID_NAME');
  return { name, priceCents, published: input.published };
}
