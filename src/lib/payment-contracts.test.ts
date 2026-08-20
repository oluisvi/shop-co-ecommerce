import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const read = (path: string) => readFileSync(path, 'utf8');

test('checkout redirects to server-created Stripe Checkout and never accepts client prices', () => {
  const checkout = read('src/pages/checkout.tsx');
  const api = read('src/lib/api/payments.ts');
  assert.match(checkout, /createCheckoutSession/);
  assert.match(checkout, /Continue to secure payment/);
  assert.match(api, /\/checkout\/sessions/);
  assert.match(api, /input: CreateOrderInput/);
  assert.doesNotMatch(read('src/lib/api/orders.ts').match(/export type CreateOrderInput = \{[\s\S]*?\n\};/)?.[0] ?? '', /unitPrice|subtotal|shippingAmount|total/);
});

test('success UI queries authoritative order status instead of trusting redirect parameters', () => {
  const success = read('src/pages/checkout/success.tsx');
  assert.match(success, /getCheckoutStatus/);
  assert.match(success, /status === ['"]PAID['"]/);
  assert.doesNotMatch(success, /paid=true|payment_status/);
});
