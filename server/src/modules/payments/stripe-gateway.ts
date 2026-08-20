import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import Stripe from 'stripe';
import { getEnv } from '../../config/env.js';

export class StripeGateway {
  constructor(private readonly stripe: Stripe, private readonly webhookSecret: string) {}

  static fromEnv() {
    const env = getEnv();
    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) return null;
    return new StripeGateway(new Stripe(env.STRIPE_SECRET_KEY), env.STRIPE_WEBHOOK_SECRET);
  }

  createCheckoutSession(params: Stripe.Checkout.SessionCreateParams) {
    return this.stripe.checkout.sessions.create(params);
  }

  verifyWebhook(rawBody: Buffer, signature?: string) {
    if (!signature) throw new BadRequestException('Missing Stripe signature');
    try { return this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret); }
    catch { throw new BadRequestException('Invalid Stripe signature'); }
  }

  static require(gateway: StripeGateway | null): StripeGateway {
    if (!gateway) throw new ServiceUnavailableException('Stripe is not configured');
    return gateway;
  }
}
