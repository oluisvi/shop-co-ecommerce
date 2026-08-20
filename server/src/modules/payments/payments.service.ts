import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type Stripe from 'stripe';
import { ApiError } from '../../common/errors/api-error.js';
import { getEnv } from '../../config/env.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { CreateOrderDto } from '../orders/dto/create-order.dto.js';
import { calculateShippingCents, centsToMoney, moneyToCents } from '../orders/pricing.js';
import { buildCheckoutSession } from './checkout-session.js';
import { StripeGateway } from './stripe-gateway.js';
import type { RequestUser } from '../auth/auth.types.js';

type PendingOrder = { id: number; orderNumber: string; subtotalCents: number; shippingCents: number; currency: string; expiresAt: Date; items: Array<{ name: string; unitAmount: number; quantity: number }> };

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService, @Inject(StripeGateway) private readonly stripe: StripeGateway | null) {}

  async createCheckout(dto: CreateOrderDto, user?: RequestUser) {
    const pending = await this.reserveAndCreate(dto, user);
    try {
      const session = await StripeGateway.require(this.stripe).createCheckoutSession(buildCheckoutSession({
        orderId: pending.id, orderNumber: pending.orderNumber, currency: pending.currency,
        items: pending.items, shippingAmount: pending.shippingCents, frontendOrigin: getEnv().FRONTEND_URL,
        expiresAt: Math.floor(pending.expiresAt.getTime() / 1000),
      }));
      await this.prisma.$transaction((tx) => tx.order.update({
        where: { id: pending.id }, data: { stripeCheckoutSessionId: session.id },
      }));
      return { orderNumber: pending.orderNumber, sessionId: session.id, url: session.url, expiresAt: session.expires_at };
    } catch (error) {
      await this.releasePendingOrder(pending.id);
      throw error;
    }
  }

  private async reserveAndCreate(dto: CreateOrderDto, user?: RequestUser): Promise<PendingOrder> {
    const lines = new Map<string, number>();
    for (const item of dto.items) lines.set(item.variantId, (lines.get(item.variantId) ?? 0) + item.quantity);
    if ([...lines.values()].some((quantity) => quantity < 1 || quantity > 9)) throw new ApiError(400, 'INVALID_QUANTITY', 'Quantity must be between 1 and 9');
    return this.prisma.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { id: { in: [...lines.keys()] } }, include: { product: true, inventory: true },
      });
      const byId = new Map(variants.map((variant) => [variant.id, variant]));
      const snapshots: Array<{ productId: string; variantId: string; productName: string; variantName: string; sku: string; unitPriceCents: number; quantity: number }> = [];
      let subtotalCents = 0;
      for (const [variantId, quantity] of lines) {
        const variant = byId.get(variantId);
        if (!variant) throw new ApiError(400, 'INVALID_VARIANT', 'Invalid product variant');
        if (!variant.active || variant.product.status !== 'ACTIVE' || !variant.inventory) throw new ApiError(409, 'VARIANT_UNAVAILABLE', 'Product variant is unavailable');
        const available = variant.inventory.quantity - variant.inventory.reservedQuantity;
        if (available < quantity) throw new ApiError(409, 'INSUFFICIENT_STOCK', 'Insufficient stock');
        const reserved = await tx.inventory.updateMany({
          where: { variantId, reservedQuantity: variant.inventory.reservedQuantity, quantity: { gte: variant.inventory.reservedQuantity + quantity } },
          data: { reservedQuantity: { increment: quantity } },
        });
        if (reserved.count !== 1) throw new ApiError(409, 'INSUFFICIENT_STOCK', 'Insufficient stock');
        const unitPriceCents = moneyToCents(variant.price); subtotalCents += unitPriceCents * quantity;
        snapshots.push({ productId: variant.productId, variantId, productName: variant.product.name,
          variantName: [variant.color, variant.size].filter(Boolean).join(' / ') || 'Default', sku: variant.sku, unitPriceCents, quantity });
      }
      const shippingCents = calculateShippingCents(subtotalCents); const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      const created = await tx.order.create({ data: {
        orderNumber: `PENDING-${randomUUID()}`, status: 'PENDING_PAYMENT', userId: user?.id,
        email: dto.customer.email.trim().toLowerCase(), firstName: dto.customer.firstName.trim(), lastName: dto.customer.lastName.trim(),
        subtotal: centsToMoney(subtotalCents), shipping: centsToMoney(shippingCents), discount: centsToMoney(0), total: centsToMoney(subtotalCents + shippingCents), currency: 'USD', paymentExpiresAt: expiresAt,
        address: { create: { ...dto.shippingAddress, country: dto.shippingAddress.country.trim().toUpperCase() } },
        items: { create: snapshots.map((item) => ({ productId: item.productId, variantId: item.variantId, productName: item.productName, variantName: item.variantName, sku: item.sku,
          unitPrice: centsToMoney(item.unitPriceCents), quantity: item.quantity, totalPrice: centsToMoney(item.unitPriceCents * item.quantity) })) },
      } });
      const orderNumber = `SHOP-${String(created.id).padStart(6, '0')}`;
      await tx.order.update({ where: { id: created.id }, data: { orderNumber } });
      return { id: created.id, orderNumber, subtotalCents, shippingCents, currency: 'USD', expiresAt,
        items: snapshots.map((item) => ({ name: `${item.productName} — ${item.variantName}`, unitAmount: item.unitPriceCents, quantity: item.quantity })) };
    });
  }

  async releasePendingOrder(orderId: number) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
      if (!order || order.status !== 'PENDING_PAYMENT') return false;
      for (const item of order.items) {
        if (!item.variantId) continue;
        await tx.inventory.updateMany({ where: { variantId: item.variantId, reservedQuantity: { gte: item.quantity } }, data: { reservedQuantity: { decrement: item.quantity } } });
      }
      await tx.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
      return true;
    });
  }

  async handleWebhook(event: Stripe.Event) {
    const paidEvents = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'];
    const cancelledEvents = ['checkout.session.expired', 'checkout.session.async_payment_failed'];
    if (!paidEvents.includes(event.type) && !cancelledEvents.includes(event.type)) return false;
    const session = event.data.object as Stripe.Checkout.Session;
    return this.prisma.$transaction(async (tx) => {
      if (await tx.paymentEvent.findUnique({ where: { id: event.id }, select: { id: true } })) return false;
      const order = await tx.order.findUnique({ where: { stripeCheckoutSessionId: session.id }, include: { items: true } });
      if (!order) {
        await tx.paymentEvent.create({ data: { id: event.id, type: event.type } });
        return false;
      }
      if (order.status === 'PENDING_PAYMENT' && paidEvents.includes(event.type)) {
        for (const item of order.items) {
          if (!item.variantId) continue;
          const finalized = await tx.inventory.updateMany({
            where: { variantId: item.variantId, quantity: { gte: item.quantity }, reservedQuantity: { gte: item.quantity } },
            data: { quantity: { decrement: item.quantity }, reservedQuantity: { decrement: item.quantity } },
          });
          if (finalized.count !== 1) throw new Error('INVENTORY_FINALIZATION_CONFLICT');
        }
        const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
        await tx.order.update({ where: { id: order.id }, data: { status: 'PAID', paidAt: new Date(), stripePaymentIntentId: paymentIntentId } });
      } else if (order.status === 'PENDING_PAYMENT' && cancelledEvents.includes(event.type)) {
        for (const item of order.items) {
          if (!item.variantId) continue;
          await tx.inventory.updateMany({
            where: { variantId: item.variantId, reservedQuantity: { gte: item.quantity } },
            data: { reservedQuantity: { decrement: item.quantity } },
          });
        }
        await tx.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
      }
      await tx.paymentEvent.create({ data: { id: event.id, type: event.type, orderId: order.id } });
      return true;
    });
  }

  async getCheckoutStatus(sessionId: string) {
    if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId) || sessionId.length > 255) throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order not found');
    const order = await this.prisma.order.findUnique({
      where: { stripeCheckoutSessionId: sessionId },
      select: { orderNumber: true, status: true, subtotal: true, shipping: true, total: true, currency: true, paidAt: true, items: { select: { productName: true, variantName: true, quantity: true, totalPrice: true } } },
    });
    if (!order) throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order not found');
    return order;
  }
}
