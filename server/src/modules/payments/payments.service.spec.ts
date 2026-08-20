import { jest } from '@jest/globals';
import { PaymentsService } from './payments.service.js';

const dto = {
  customer: { email: 'buyer@example.com', firstName: 'Ada', lastName: 'Lovelace' },
  shippingAddress: { firstName: 'Ada', lastName: 'Lovelace', addressLine1: '1 Example St', city: 'London', state: 'London', postalCode: 'SW1A', country: 'GB' },
  items: [{ variantId: 'variant-1', quantity: 1 }],
};

function makeService(gatewayFails = false) {
  const variant = { id: 'variant-1', productId: 'product-1', sku: 'PIECE-ONE', color: 'Black', size: 'M', price: 89, active: true,
    product: { id: 'product-1', name: 'Archive jacket', status: 'ACTIVE' }, inventory: { quantity: 1, reservedQuantity: 0 } };
  const inventoryUpdateMany = jest.fn<(...args: unknown[]) => Promise<{ count: number }>>(async () => ({ count: 1 }));
  const orderCreate = jest.fn<(...args: unknown[]) => Promise<{ id: number }>>(async () => ({ id: 42 }));
  const orderUpdate = jest.fn<(...args: unknown[]) => Promise<Record<string, unknown>>>(async () => ({ id: 42, orderNumber: 'SHOP-000042', status: 'PENDING_PAYMENT' }));
  const paymentEventFindUnique = jest.fn<(...args: unknown[]) => Promise<null | { id: string }>>(async () => null);
  const paymentEventCreate = jest.fn<(...args: unknown[]) => Promise<Record<string, unknown>>>(async () => ({ id: 'evt_1' }));
  const tx = {
    productVariant: { findMany: async () => [variant] }, inventory: { updateMany: inventoryUpdateMany },
    order: { create: orderCreate, update: orderUpdate, findUnique: async () => ({ id: 42, status: 'PENDING_PAYMENT', items: [{ variantId: 'variant-1', quantity: 1 }] }) },
    paymentEvent: { findUnique: paymentEventFindUnique, create: paymentEventCreate },
  };
  const transaction = jest.fn(async (fn: (client: typeof tx) => unknown) => fn(tx));
  const createCheckoutSession = jest.fn<(...args: unknown[]) => Promise<{ id: string; url: string; expires_at: number }>>(async () => {
    if (gatewayFails) throw new Error('Stripe unavailable');
    return { id: 'cs_test_123', url: 'https://checkout.stripe.com/c/pay/cs_test_123', expires_at: 1_800_000_000 };
  });
  return { service: new PaymentsService({ $transaction: transaction } as never, { createCheckoutSession } as never), tx, createCheckoutSession, paymentEventFindUnique };
}

describe('PaymentsService checkout creation', () => {
  it('reserves stock and builds Stripe amounts exclusively from database prices', async () => {
    const { service, tx, createCheckoutSession } = makeService();
    await expect(service.createCheckout(dto, undefined)).resolves.toMatchObject({ sessionId: 'cs_test_123', url: expect.stringContaining('stripe.com') });
    expect(tx.inventory.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { reservedQuantity: { increment: 1 } } }));
    expect(tx.order.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'PENDING_PAYMENT', subtotal: '89.00' }) }));
    expect(createCheckoutSession).toHaveBeenCalledWith(expect.objectContaining({ line_items: expect.arrayContaining([expect.objectContaining({ price_data: expect.objectContaining({ unit_amount: 8900 }) })]) }));
  });

  it('releases the reservation and cancels the order when Stripe creation fails', async () => {
    const { service, tx } = makeService(true);
    await expect(service.createCheckout(dto, undefined)).rejects.toThrow('Stripe unavailable');
    expect(tx.inventory.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { reservedQuantity: { decrement: 1 } } }));
    expect(tx.order.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'CANCELLED' } }));
  });
});

describe('PaymentsService webhook finalization', () => {
  const event = (id: string, type: string) => ({ id, type, data: { object: { id: 'cs_test_123', payment_intent: 'pi_123' } } }) as never;

  it('finalizes physical and reserved inventory exactly once on payment', async () => {
    const { service, tx } = makeService();
    await service.handleWebhook(event('evt_paid', 'checkout.session.completed'));
    expect(tx.inventory.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { quantity: { decrement: 1 }, reservedQuantity: { decrement: 1 } },
    }));
    expect(tx.order.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'PAID', stripePaymentIntentId: 'pi_123' }) }));
    expect(tx.paymentEvent.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ id: 'evt_paid' }) }));
  });

  it('ignores a duplicate event before touching inventory', async () => {
    const { service, tx, paymentEventFindUnique } = makeService();
    paymentEventFindUnique.mockResolvedValueOnce({ id: 'evt_paid' });
    await service.handleWebhook(event('evt_paid', 'checkout.session.completed'));
    expect(tx.inventory.updateMany).not.toHaveBeenCalled();
    expect(tx.paymentEvent.create).not.toHaveBeenCalled();
  });

  it('releases reserved stock when the Checkout Session expires', async () => {
    const { service, tx } = makeService();
    await service.handleWebhook(event('evt_expired', 'checkout.session.expired'));
    expect(tx.inventory.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { reservedQuantity: { decrement: 1 } } }));
    expect(tx.order.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'CANCELLED' } }));
  });
});
