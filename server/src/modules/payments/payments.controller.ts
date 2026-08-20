import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { OptionalSupabaseAuthGuard } from '../auth/auth.guard.js';
import type { RequestUser } from '../auth/auth.types.js';
import { CreateOrderDto } from '../orders/dto/create-order.dto.js';
import { PaymentsService } from './payments.service.js';

@Controller('checkout/sessions')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}
  @Post() @UseGuards(OptionalSupabaseAuthGuard) @Throttle({ default: { limit: 10, ttl: 60_000 } })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user?: RequestUser) { return this.payments.createCheckout(dto, user); }
  @Get(':sessionId') @Throttle({ default: { limit: 30, ttl: 60_000 } })
  status(@Param('sessionId') sessionId: string) { return this.payments.getCheckoutStatus(sessionId); }
}
