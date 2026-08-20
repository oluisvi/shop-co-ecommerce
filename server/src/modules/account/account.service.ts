import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';

const profileSelect = { id: true, email: true, firstName: true, lastName: true, phone: true, createdAt: true } as const;
const orderInclude = { items: true, address: true } as const;

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(userId: string) {
    return this.prisma.profile.findUniqueOrThrow({ where: { id: userId }, select: profileSelect });
  }

  updateProfile(userId: string, dto: UpdateProfileDto) {
    if (!userId) throw new ForbiddenException('Verified profile required');
    return this.prisma.profile.update({
      where: { id: userId },
      data: { firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone },
      select: profileSelect,
    });
  }

  listOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrder(userId: string, orderNumber: string) {
    const order = await this.prisma.order.findUnique({ where: { orderNumber }, include: orderInclude });
    if (!order || order.userId !== userId) throw new NotFoundException('Order not found');
    return order;
  }
}
