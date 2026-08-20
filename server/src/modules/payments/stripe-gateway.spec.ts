import { BadRequestException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { StripeGateway } from './stripe-gateway.js';

describe('StripeGateway webhook verification', () => {
  it('passes the untouched raw body, signature, and webhook secret to Stripe', () => {
    const raw = Buffer.from('{"id":"evt_1"}');
    const constructEvent = jest.fn(() => ({ id: 'evt_1', type: 'checkout.session.completed' }));
    const gateway = new StripeGateway({ webhooks: { constructEvent } } as never, 'whsec_test');
    expect(gateway.verifyWebhook(raw, 'signed-header')).toMatchObject({ id: 'evt_1' });
    expect(constructEvent).toHaveBeenCalledWith(raw, 'signed-header', 'whsec_test');
  });

  it('rejects missing or invalid signatures without parsing trusted JSON', () => {
    const gateway = new StripeGateway({ webhooks: { constructEvent: () => { throw new Error('bad signature'); } } } as never, 'whsec_test');
    expect(() => gateway.verifyWebhook(Buffer.from('{}'), undefined)).toThrow(BadRequestException);
    expect(() => gateway.verifyWebhook(Buffer.from('{}'), 'forged')).toThrow(BadRequestException);
  });
});
