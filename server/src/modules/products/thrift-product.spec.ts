import { createOneOffVariant, normalizeThriftText } from './thrift-product.js';

describe('thrift product domain', () => {
  it('defaults a single thrift piece to one active unit', () => {
    expect(createOneOffVariant({ productId: 'piece-1', slug: 'linen-jacket', priceCents: 8900 })).toEqual({
      id: 'piece-1-default',
      sku: 'LINEN-JACKET-ONE',
      size: 'ONE SIZE',
      priceCents: 8900,
      quantity: 1,
      active: true,
    });
  });

  it('trims plain seller text and rejects empty or excessive content', () => {
    expect(normalizeThriftText('  Light wear at cuff.  ', 80)).toBe('Light wear at cuff.');
    expect(() => normalizeThriftText('   ', 80)).toThrow('INVALID_TEXT');
    expect(() => normalizeThriftText('x'.repeat(81), 80)).toThrow('INVALID_TEXT');
  });

  it('rejects non-positive one-off prices', () => {
    expect(() => createOneOffVariant({ productId: 'piece-1', slug: 'piece', priceCents: 0 })).toThrow(
      'INVALID_PRICE',
    );
  });
});
