import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../../prisma/prisma.service.js";
import { ApiError } from "../../common/errors/api-error.js";
import type { CreateOrderDto } from "./dto/create-order.dto.js";
import { calculateShippingCents, centsToMoney, moneyToCents } from "./pricing.js";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const customer = {
      email: dto.customer.email.trim(),
      firstName: dto.customer.firstName.trim(),
      lastName: dto.customer.lastName.trim(),
    };
    const shippingAddress = {
      firstName: dto.shippingAddress.firstName.trim(),
      lastName: dto.shippingAddress.lastName.trim(),
      addressLine1: dto.shippingAddress.addressLine1.trim(),
      ...(dto.shippingAddress.addressLine2?.trim() ? { addressLine2: dto.shippingAddress.addressLine2.trim() } : {}),
      city: dto.shippingAddress.city.trim(),
      state: dto.shippingAddress.state.trim(),
      postalCode: dto.shippingAddress.postalCode.trim(),
      country: dto.shippingAddress.country.trim().toUpperCase(),
    };
    try {
      return await this.prisma.$transaction(async (tx) => {
        const snapshots: Array<{
          productId: string;
          variantId: string;
          productName: string;
          variantName: string;
          sku: string;
          unitPriceCents: number;
          quantity: number;
        }> = [];
        let subtotalCents = 0;

        const variantIds = [...new Set(dto.items.map((line) => line.variantId))];
        const variantRecords = await tx.productVariant.findMany({
          where: { id: { in: variantIds } },
          include: { product: true, inventory: true },
        });
        const variants = new Map(variantRecords.map((variant) => [variant.id, variant]));

        for (const line of dto.items) {
          if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 9) {
            throw new ApiError(400, "INVALID_QUANTITY", "Quantity must be an integer between 1 and 9");
          }
          const variant = variants.get(line.variantId);
          if (!variant) throw new ApiError(400, "INVALID_VARIANT", "Invalid product variant");
          if (!variant.active || variant.product.status !== "ACTIVE") {
            throw new ApiError(409, "VARIANT_UNAVAILABLE", "Product variant is unavailable");
          }
          if (!variant.inventory) {
            throw new ApiError(409, "INSUFFICIENT_STOCK", "Product variant has no available stock");
          }
          const available = Math.max(0, variant.inventory.quantity - variant.inventory.reservedQuantity);
          if (available < line.quantity) {
            throw new ApiError(409, "INSUFFICIENT_STOCK", "Insufficient stock");
          }

          const updated = await tx.inventory.updateMany({
            where: {
              variantId: variant.id,
              quantity: { gte: line.quantity + variant.inventory.reservedQuantity },
            },
            data: { quantity: { decrement: line.quantity } },
          });
          if (updated.count !== 1) {
            throw new ApiError(409, "INSUFFICIENT_STOCK", "Insufficient stock");
          }

          const unitPriceCents = moneyToCents(variant.price);
          subtotalCents += unitPriceCents * line.quantity;
          const option = [variant.color, variant.size].filter(Boolean).join(" / ") || "Default";
          snapshots.push({
            productId: variant.productId,
            variantId: variant.id,
            productName: variant.product.name,
            variantName: option,
            sku: variant.sku,
            unitPriceCents,
            quantity: line.quantity,
          });
        }

        const shippingCents = calculateShippingCents(subtotalCents);
        const totalCents = subtotalCents + shippingCents;
        const created = await tx.order.create({
          data: {
            orderNumber: `PENDING-${randomUUID()}`,
            status: "CREATED",
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            subtotal: centsToMoney(subtotalCents),
            shipping: centsToMoney(shippingCents),
            discount: centsToMoney(0),
            total: centsToMoney(totalCents),
            currency: "USD",
            address: { create: shippingAddress },
            items: {
              create: snapshots.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                productName: item.productName,
                variantName: item.variantName,
                sku: item.sku,
                unitPrice: centsToMoney(item.unitPriceCents),
                quantity: item.quantity,
                totalPrice: centsToMoney(item.unitPriceCents * item.quantity),
              })),
            },
          },
        });
        const orderNumber = `SHOP-${String(created.id).padStart(6, "0")}`;
        const order = await tx.order.update({
          where: { id: created.id },
          data: { orderNumber },
          include: { items: true },
        });
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          subtotal: Number(order.subtotal),
          shipping: Number(order.shipping),
          discount: Number(order.discount),
          total: Number(order.total),
          currency: order.currency,
          createdAt: order.createdAt,
          items: order.items.map((item) => ({
            productName: item.productName,
            variantName: item.variantName,
            sku: item.sku,
            unitPrice: Number(item.unitPrice),
            quantity: item.quantity,
            totalPrice: Number(item.totalPrice),
          })),
        };
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        context: "OrdersService",
        message: "Order creation failed",
        error: error instanceof Error ? error.name : "UnknownError",
      }));
      throw error;
    }
  }
}
