import assert from 'node:assert/strict';
import test from 'node:test';
import { buildStudioProductUpdate, getNextFulfillmentStatus } from './studio-ui.ts';

test('Studio offers only the legal next fulfillment transition', () => {
  assert.equal(getNextFulfillmentStatus('PAID'), 'PROCESSING');
  assert.equal(getNextFulfillmentStatus('PROCESSING'), 'SHIPPED');
  assert.equal(getNextFulfillmentStatus('SHIPPED'), 'DELIVERED');
  assert.equal(getNextFulfillmentStatus('PENDING_PAYMENT'), null);
  assert.equal(getNextFulfillmentStatus('DELIVERED'), null);
});

test('Studio product edits convert authoritative price input to integer cents', () => {
  assert.deepEqual(buildStudioProductUpdate({ name: ' Archive Jacket ', price: '89.50', published: true }), {
    name: 'Archive Jacket',
    priceCents: 8950,
    published: true,
  });
});

test('Studio product edits reject invalid price input before calling the API', () => {
  assert.throws(() => buildStudioProductUpdate({ name: 'Jacket', price: '0', published: true }), /INVALID_PRICE/);
});
