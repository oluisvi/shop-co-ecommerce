import { randomUUID } from 'node:crypto';
import type { GarmentCondition, OrderStatus } from '../../generated/prisma/enums.js';

export type OneOffProductInput = Readonly<{
  name: string; slug: string; description?: string; categoryId: string; collection: string;
  cardImage: string; priceCents: number; condition?: GarmentCondition; conditionNotes?: string;
  brand?: string; material?: string; measurements?: Record<string, string>;
  imperfections?: string; size?: string; color?: string; published: boolean;
}>;

export function buildOneOffProductCreate(input: OneOffProductInput) {
  if (!Number.isSafeInteger(input.priceCents) || input.priceCents <= 0) throw new Error('INVALID_PRICE');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) throw new Error('INVALID_SLUG');
  const productId = randomUUID();
  const variantId = randomUUID();
  return {
    id: productId,
    name: input.name.trim(), slug: input.slug, description: input.description?.trim(),
    categoryId: input.categoryId, collection: input.collection.trim(), cardImage: input.cardImage,
    rating: '0.0', status: input.published ? 'ACTIVE' as const : 'DRAFT' as const,
    publishedAt: input.published ? new Date() : null,
    condition: input.condition, conditionNotes: input.conditionNotes?.trim(), brand: input.brand?.trim(),
    material: input.material?.trim(), measurements: input.measurements, imperfections: input.imperfections?.trim(),
    images: { create: [{ url: input.cardImage, alt: input.name.trim(), position: 0 }] },
    variants: { create: {
      id: variantId, sku: `${input.slug.toUpperCase()}-ONE`, size: input.size?.trim() || 'ONE SIZE',
      color: input.color?.trim(), price: (input.priceCents / 100).toFixed(2), active: true,
      inventory: { create: { quantity: 1, reservedQuantity: 0 } },
    } },
  };
}

const allowed: Partial<Record<OrderStatus, OrderStatus>> = {
  PAID: 'PROCESSING', PROCESSING: 'SHIPPED', SHIPPED: 'DELIVERED',
};

export function nextFulfillmentStatus(current: OrderStatus, requested: OrderStatus) {
  if (current === requested && ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(current)) return current;
  if (allowed[current] !== requested) throw new Error('INVALID_FULFILLMENT_TRANSITION');
  return requested;
}
