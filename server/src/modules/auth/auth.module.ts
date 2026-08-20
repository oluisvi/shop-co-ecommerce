import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { OptionalSupabaseAuthGuard, SellerGuard, SupabaseAuthGuard } from './auth.guard.js';

@Module({ providers: [AuthService, SupabaseAuthGuard, OptionalSupabaseAuthGuard, SellerGuard], exports: [AuthService, SupabaseAuthGuard, OptionalSupabaseAuthGuard, SellerGuard] })
export class AuthModule {}
