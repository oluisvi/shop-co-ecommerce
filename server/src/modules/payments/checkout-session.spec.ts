import { buildCheckoutSession, transitionPayment } from './checkout-session.js';

describe('Stripe checkout domain', () => {
  it('builds line items exclusively from server-authoritative prices and fixed origins', () => {
    const session = buildCheckoutSession({
      orderId: 42, orderNumber: 'SHOP-000042', currency: 'USD',
      items: [{ name: 'Archive jacket', unitAmount: 8900, quantity: 1 }],
      shippingAmount: 1500, frontendOrigin: 'https://shop.example.com', expiresAt: 1_800_000_000,
    });
    expect(session.line_items).toEqual([
      { price_data: { currency: 'usd', product_data: { name: 'Archive jacket' }, unit_amount: 8900 }, quantity: 1 },
      { price_data: { currency: 'usd', product_data: { name: 'Shipping' }, unit_amount: 1500 }, quantity: 1 },
    ]);
    expect(session.success_url).toBe('https://shop.example.com/checkout/success?session_id={CHECKOUT_SESSION_ID}');
    expect(session.cancel_url).toBe('https://shop.example.com/checkout/cancel');
    expect(session.metadata).toEqual({ orderId: '42', orderNumber: 'SHOP-000042' });
  });

  it('omits the shipping line when shipping is free', () => {
    const session = buildCheckoutSession({ orderId: 1, orderNumber: 'SHOP-000001', currency: 'USD', items: [{ name: 'Coat', unitAmount: 15000, quantity: 1 }], shippingAmount: 0, frontendOrigin: 'https://shop.example.com', expiresAt: 1_800_000_000 });
    expect(session.line_items).toHaveLength(1);
  });

  it('only allows signed webhook lifecycle transitions', () => {
    expect(transitionPayment('PENDING_PAYMENT', 'checkout.session.completed')).toBe('PAID');
    expect(transitionPayment('PENDING_PAYMENT', 'checkout.session.expired')).toBe('CANCELLED');
    expect(transitionPayment('PAID', 'checkout.session.completed')).toBe('PAID');
    expect(() => transitionPayment('CREATED', 'checkout.session.completed')).toThrow('INVALID_PAYMENT_TRANSITION');
  });
});
