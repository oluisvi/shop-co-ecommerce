import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { SellerGuard, SupabaseAuthGuard } from './auth.guard.js';

@Module({ providers: [AuthService, SupabaseAuthGuard, SellerGuard], exports: [AuthService, SupabaseAuthGuard, SellerGuard] })
export class AuthModule {}
