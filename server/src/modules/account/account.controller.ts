import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { SupabaseAuthGuard } from '../auth/auth.guard.js';
import type { RequestUser } from '../auth/auth.types.js';
import { AccountService } from './account.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Controller('account')
@UseGuards(SupabaseAuthGuard)
export class AccountController {
  constructor(private readonly account: AccountService) {}
  @Get() profile(@CurrentUser() user: RequestUser) { return this.account.getProfile(user.id); }
  @Patch() update(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfileDto) { return this.account.updateProfile(user.id, dto); }
  @Get('orders') orders(@CurrentUser() user: RequestUser) { return this.account.listOrders(user.id); }
  @Get('orders/:orderNumber') order(@CurrentUser() user: RequestUser, @Param('orderNumber') orderNumber: string) { return this.account.getOrder(user.id, orderNumber); }
}
