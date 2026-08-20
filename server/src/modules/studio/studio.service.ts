import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { RequestUser } from '../auth/auth.types.js';
import type { CreateStudioProductDto } from './dto/create-studio-product.dto.js';
import type { UpdateStudioProductDto } from './dto/update-studio-product.dto.js';
import { buildOneOffProductCreate, nextFulfillmentStatus } from './studio-domain.js';
import type { OrderStatus } from '../../generated/prisma/enums.js';

@Injectable()
export class StudioService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [activePieces, draftPieces, soldOutPieces, paidOrders, recentOrders] = await Promise.all([
      this.prisma.product.count({ where: { status: 'ACTIVE' } }),
      this.prisma.product.count({ where: { status: 'DRAFT' } }),
      this.prisma.product.count({ where: { variants: { every: { inventory: { quantity: 0 } } } } }),
      this.prisma.order.count({ where: { status: 'PAID' } }),
      this.prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { items: true } }),
    ]);
    return { activePieces, draftPieces, soldOutPieces, paidOrders, recentOrders };
  }

  listProducts() {
    return this.prisma.product.findMany({
      orderBy: { updatedAt: 'desc' }, include: { category: true, images: true, variants: { include: { inventory: true } } },
    });
  }

  listCategories() { return this.prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, slug: true, name: true } }); }

  async createProduct(actor: RequestUser, dto: CreateStudioProductDto) {
    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId }, select: { id: true } });
    if (!category) throw new BadRequestException('Category does not exist');
    const data = buildOneOffProductCreate(dto);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.create({ data, include: { images: true, variants: { include: { inventory: true } } } });
        await tx.auditEvent.create({ data: { actorId: actor.id, action: 'PRODUCT_CREATED', targetType: 'Product', targetId: product.id } });
        return product;
      });
    } catch (error) {
      if (error instanceof Error && /unique/i.test(error.message)) throw new ConflictException('Product slug or SKU already exists');
      throw error;
    }
  }

  async updateProduct(actor: RequestUser, id: string, dto: UpdateStudioProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id }, include: { variants: { take: 1 } } });
    if (!existing) throw new NotFoundException('Product not found');
    const data = {
      name: dto.name, description: dto.description, collection: dto.collection, cardImage: dto.cardImage,
      condition: dto.condition, conditionNotes: dto.conditionNotes, brand: dto.brand, material: dto.material,
      measurements: dto.measurements, imperfections: dto.imperfections,
      status: dto.published === undefined ? undefined : dto.published ? 'ACTIVE' as const : 'DRAFT' as const,
      publishedAt: dto.published === true ? existing.publishedAt ?? new Date() : dto.published === false ? null : undefined,
    };
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({ where: { id }, data });
      if (dto.priceCents !== undefined && existing.variants[0]) {
        await tx.productVariant.update({ where: { id: existing.variants[0].id }, data: { price: (dto.priceCents / 100).toFixed(2) } });
      }
      await tx.auditEvent.create({ data: { actorId: actor.id, action: 'PRODUCT_UPDATED', targetType: 'Product', targetId: id } });
      return product;
    });
  }

  async archiveProduct(actor: RequestUser, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({ where: { id }, data: { status: 'ARCHIVED' } });
      await tx.auditEvent.create({ data: { actorId: actor.id, action: 'PRODUCT_ARCHIVED', targetType: 'Product', targetId: id } });
      return product;
    });
  }

  async adjustInventory(actor: RequestUser, variantId: string, quantity: number) {
    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { variantId } });
      if (!inventory) throw new NotFoundException('Variant inventory not found');
      if (quantity < inventory.reservedQuantity) throw new ConflictException('Quantity cannot be below reserved stock');
      const updated = await tx.inventory.update({ where: { variantId }, data: { quantity } });
      await tx.auditEvent.create({ data: { actorId: actor.id, action: 'INVENTORY_ADJUSTED', targetType: 'ProductVariant', targetId: variantId } });
      return updated;
    });
  }

  listOrders() {
    return this.prisma.order.findMany({ orderBy: { createdAt: 'desc' }, include: { items: true, address: true } });
  }

  async updateFulfillment(actor: RequestUser, orderNumber: string, requested: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { orderNumber } });
    if (!order) throw new NotFoundException('Order not found');
    let status: OrderStatus;
    try { status = nextFulfillmentStatus(order.status, requested); }
    catch { throw new ConflictException('Invalid fulfillment transition'); }
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({ where: { id: order.id }, data: { status } });
      await tx.auditEvent.create({ data: { actorId: actor.id, action: 'ORDER_STATUS_CHANGED', targetType: 'Order', targetId: String(order.id) } });
      return updated;
    });
  }
}
