import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { SellerGuard, SupabaseAuthGuard } from '../auth/auth.guard.js';
import type { RequestUser } from '../auth/auth.types.js';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto.js';
import { CreateStudioProductDto } from './dto/create-studio-product.dto.js';
import { UpdateFulfillmentDto } from './dto/update-fulfillment.dto.js';
import { UpdateStudioProductDto } from './dto/update-studio-product.dto.js';
import { StudioService } from './studio.service.js';
import { StudioUploadService } from './studio-upload.service.js';

@Controller('studio')
@UseGuards(SupabaseAuthGuard, SellerGuard)
export class StudioController {
  constructor(private readonly studio: StudioService, private readonly uploads: StudioUploadService) {}
  @Get('dashboard') dashboard() { return this.studio.dashboard(); }
  @Get('products') products() { return this.studio.listProducts(); }
  @Get('categories') categories() { return this.studio.listCategories(); }
  @Post('products') create(@CurrentUser() user: RequestUser, @Body() dto: CreateStudioProductDto) { return this.studio.createProduct(user, dto); }
  @Patch('products/:id') update(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateStudioProductDto) { return this.studio.updateProduct(user, id, dto); }
  @Post('products/:id/archive') archive(@CurrentUser() user: RequestUser, @Param('id') id: string) { return this.studio.archiveProduct(user, id); }
  @Patch('inventory/:variantId') inventory(@CurrentUser() user: RequestUser, @Param('variantId') variantId: string, @Body() dto: AdjustInventoryDto) { return this.studio.adjustInventory(user, variantId, dto.quantity); }
  @Get('orders') orders() { return this.studio.listOrders(); }
  @Patch('orders/:orderNumber/status') orderStatus(@CurrentUser() user: RequestUser, @Param('orderNumber') orderNumber: string, @Body() dto: UpdateFulfillmentDto) { return this.studio.updateFulfillment(user, orderNumber, dto.status); }
  @Post('uploads')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage(), limits: { fileSize: 8 * 1024 * 1024, files: 1 } }))
  upload(@UploadedFile() file?: Express.Multer.File) { return this.uploads.upload(file); }
}
