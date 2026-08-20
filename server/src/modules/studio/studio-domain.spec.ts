import { buildOneOffProductCreate, nextFulfillmentStatus } from './studio-domain.js';

describe('Seller Studio domain', () => {
  it('builds a published one-off piece with exactly one unit', () => {
    const data = buildOneOffProductCreate({
      name: 'Washed linen jacket', slug: 'washed-linen-jacket', description: 'Curated archive piece.',
      categoryId: 'cat-jackets', collection: 'Archive 01', cardImage: 'https://cdn.example.com/jacket.webp',
      priceCents: 8900, condition: 'EXCELLENT', size: 'M', color: 'Stone', published: true,
    });
    expect(data.status).toBe('ACTIVE');
    expect(data.publishedAt).toBeInstanceOf(Date);
    expect(data.variants.create.inventory.create.quantity).toBe(1);
    expect(data.variants.create.price).toBe('89.00');
  });

  it('keeps drafts unpublished and rejects invalid stock or price', () => {
    const draft = buildOneOffProductCreate({
      name: 'Draft coat', slug: 'draft-coat', categoryId: 'cat', collection: 'Drafts',
      cardImage: 'https://cdn.example.com/coat.webp', priceCents: 100, published: false,
    });
    expect(draft.status).toBe('DRAFT');
    expect(draft.publishedAt).toBeNull();
    expect(() => buildOneOffProductCreate({
      name: 'Invalid coat', slug: 'invalid-coat', categoryId: 'cat', collection: 'Drafts',
      cardImage: 'https://cdn.example.com/coat.webp', priceCents: 0, published: false,
    })).toThrow('INVALID_PRICE');
  });

  it('allows only forward fulfillment transitions and never manual PAID', () => {
    expect(nextFulfillmentStatus('PAID', 'PROCESSING')).toBe('PROCESSING');
    expect(nextFulfillmentStatus('PROCESSING', 'SHIPPED')).toBe('SHIPPED');
    expect(nextFulfillmentStatus('SHIPPED', 'DELIVERED')).toBe('DELIVERED');
    expect(() => nextFulfillmentStatus('PENDING_PAYMENT', 'PAID')).toThrow('INVALID_FULFILLMENT_TRANSITION');
    expect(() => nextFulfillmentStatus('SHIPPED', 'PROCESSING')).toThrow('INVALID_FULFILLMENT_TRANSITION');
  });
});
