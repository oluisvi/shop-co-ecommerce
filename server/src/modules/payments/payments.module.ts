import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { StripeGateway } from './stripe-gateway.js';
import { StripeWebhookController } from './stripe-webhook.controller.js';

@Module({
  imports: [AuthModule], controllers: [PaymentsController, StripeWebhookController],
  providers: [PaymentsService, { provide: StripeGateway, useFactory: () => StripeGateway.fromEnv() }],
  exports: [PaymentsService],
})
export class PaymentsModule {}
