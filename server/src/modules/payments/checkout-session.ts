import type Stripe from 'stripe';
import type { OrderStatus } from '../../generated/prisma/enums.js';

type CheckoutInput = Readonly<{
  orderId: number;
  orderNumber: string;
  currency: string;
  items: ReadonlyArray<{ name: string; unitAmount: number; quantity: number }>;
  shippingAmount: number;
  frontendOrigin: string;
  expiresAt: number;
}>;

export function buildCheckoutSession(input: CheckoutInput): Stripe.Checkout.SessionCreateParams {
  const currency = input.currency.toLowerCase();
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = input.items.map((item) => ({
    price_data: { currency, product_data: { name: item.name }, unit_amount: item.unitAmount },
    quantity: item.quantity,
  }));
  if (input.shippingAmount > 0) {
    lineItems.push({ price_data: { currency, product_data: { name: 'Shipping' }, unit_amount: input.shippingAmount }, quantity: 1 });
  }
  return {
    mode: 'payment',
    line_items: lineItems,
    expires_at: input.expiresAt,
    success_url: `${input.frontendOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.frontendOrigin}/checkout/cancel`,
    metadata: { orderId: String(input.orderId), orderNumber: input.orderNumber },
  };
}

export function transitionPayment(status: OrderStatus, eventType: string): OrderStatus {
  if (status === 'PAID' && eventType === 'checkout.session.completed') return status;
  if (status !== 'PENDING_PAYMENT') throw new Error('INVALID_PAYMENT_TRANSITION');
  if (eventType === 'checkout.session.completed' || eventType === 'checkout.session.async_payment_succeeded') return 'PAID';
  if (eventType === 'checkout.session.expired' || eventType === 'checkout.session.async_payment_failed') return 'CANCELLED';
  throw new Error('UNSUPPORTED_PAYMENT_EVENT');
}
