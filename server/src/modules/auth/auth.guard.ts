import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { AuthenticatedRequest } from './auth.types.js';

export function extractBearerToken(header?: string) {
  const match = header?.match(/^Bearer\s+(\S+)$/i);
  if (!match?.[1]) throw new UnauthorizedException('Bearer access token required');
  return match[1];
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request.headers.authorization);
    request.user = await this.auth.authenticate(token);
    return true;
  }
}

@Injectable()
export class OptionalSupabaseAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.headers.authorization) return true;
    const token = extractBearerToken(request.headers.authorization);
    request.user = await this.auth.authenticate(token);
    return true;
  }
}

@Injectable()
export class SellerGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
    if (!user) throw new UnauthorizedException('Authentication required');
    if (user.role !== 'SELLER') throw new ForbiddenException('Seller access required');
    return true;
  }
}
