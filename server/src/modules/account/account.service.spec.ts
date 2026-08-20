import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { AccountService } from './account.service.js';

describe('AccountService ownership', () => {
  const userId = '4e8f6f86-68af-4e6c-9154-e670035436a1';

  it('lists only orders owned by the verified profile', async () => {
    const findMany = jest.fn<() => Promise<unknown[]>>().mockResolvedValue([]);
    const service = new AccountService({ order: { findMany } } as never);
    await service.listOrders(userId);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId } }));
  });

  it('does not disclose another customer order', async () => {
    const findUnique = jest.fn<() => Promise<{ id: number; userId: string }>>().mockResolvedValue({ id: 7, userId: 'eb861ce7-7bc2-4826-9235-7896a829df7c' });
    const service = new AccountService({ order: { findUnique } } as never);
    await expect(service.getOrder(userId, 'SHOP-000007')).rejects.toThrow(NotFoundException);
  });

  it('rejects an ownerless guest order instead of claiming it by email', async () => {
    const findUnique = jest.fn<() => Promise<{ id: number; userId: null; email: string }>>().mockResolvedValue({ id: 8, userId: null, email: 'buyer@example.com' });
    const service = new AccountService({ order: { findUnique } } as never);
    await expect(service.getOrder(userId, 'SHOP-000008')).rejects.toThrow(NotFoundException);
  });

  it('prevents profile updates from changing role or identity', async () => {
    const update = jest.fn<() => Promise<{ id: string; role: string }>>().mockResolvedValue({ id: userId, role: 'CUSTOMER' });
    const service = new AccountService({ profile: { update } } as never);
    await service.updateProfile(userId, { firstName: 'Luis', lastName: 'Vieira', phone: null });
    expect(update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { firstName: 'Luis', lastName: 'Vieira', phone: null },
      select: expect.not.objectContaining({ role: true }),
    });
    expect(() => service.updateProfile('', { firstName: 'Luis' })).toThrow(ForbiddenException);
  });
});
