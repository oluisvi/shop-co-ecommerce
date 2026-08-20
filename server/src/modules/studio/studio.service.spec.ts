import { ConflictException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { StudioService } from './studio.service.js';

const actor = { id: '31a64141-efa8-42c9-81e1-187192b225b8', email: 'owner@example.com', role: 'SELLER' as const };

describe('StudioService product update contract', () => {
  it('rejects edits to an archived product instead of reactivating it', async () => {
    const findUnique = jest.fn<() => Promise<{ id: string; status: 'ARCHIVED'; publishedAt: Date | null; variants: Array<{ id: string }> }>>()
      .mockResolvedValue({ id: 'product-1', status: 'ARCHIVED', publishedAt: null, variants: [{ id: 'variant-1' }] });
    const service = new StudioService({ product: { findUnique } } as never);

    await expect(service.updateProduct(actor, 'product-1', {
      name: 'Archived piece',
      priceCents: 8900,
      published: true,
    })).rejects.toThrow(ConflictException);
  });

  it('updates active product fields and variant price inside one transaction', async () => {
    const findUnique = jest.fn<() => Promise<{ id: string; status: 'ACTIVE'; publishedAt: Date; variants: Array<{ id: string }> }>>()
      .mockResolvedValue({ id: 'product-1', status: 'ACTIVE', publishedAt: new Date('2026-08-20'), variants: [{ id: 'variant-1' }] });
    const productUpdate = jest.fn(async () => ({ id: 'product-1' }));
    const variantUpdate = jest.fn(async () => ({ id: 'variant-1' }));
    const auditCreate = jest.fn(async () => ({ id: 'audit-1' }));
    const tx = { product: { update: productUpdate }, productVariant: { update: variantUpdate }, auditEvent: { create: auditCreate } };
    const transaction = jest.fn(async (operation: (client: typeof tx) => unknown) => operation(tx));
    const service = new StudioService({ product: { findUnique }, $transaction: transaction } as never);

    await service.updateProduct(actor, 'product-1', { name: 'Updated piece', priceCents: 8950, published: false });

    expect(productUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'product-1' },
      data: expect.objectContaining({ name: 'Updated piece', status: 'DRAFT', publishedAt: null }),
    }));
    expect(variantUpdate).toHaveBeenCalledWith({ where: { id: 'variant-1' }, data: { price: '89.50' } });
  });
});
