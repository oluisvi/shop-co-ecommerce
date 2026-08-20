import { Controller, Headers, Inject, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service.js';
import { StripeGateway } from './stripe-gateway.js';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(private readonly payments: PaymentsService, @Inject(StripeGateway) private readonly stripe: StripeGateway | null) {}
  @Post()
  async receive(@Req() request: Request, @Headers('stripe-signature') signature?: string) {
    if (!Buffer.isBuffer(request.body)) throw new Error('Stripe webhook raw body is required');
    const event = StripeGateway.require(this.stripe).verifyWebhook(request.body, signature);
    await this.payments.handleWebhook(event);
    return { received: true };
  }
}
