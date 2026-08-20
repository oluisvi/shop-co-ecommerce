import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { getEnv } from '../../config/env.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { createSupabaseJwtVerifier, type AuthenticatedUser } from './supabase-jwt-verifier.js';
import type { RequestUser } from './auth.types.js';

@Injectable()
export class AuthService {
  private readonly verify: ((token: string) => Promise<AuthenticatedUser>) | null;

  constructor(private readonly prisma: PrismaService) {
    const env = getEnv();
    this.verify = env.SUPABASE_URL
      ? createSupabaseJwtVerifier({ supabaseUrl: env.SUPABASE_URL, audience: 'authenticated' })
      : null;
  }

  async authenticate(token: string): Promise<RequestUser> {
    if (!this.verify) throw new ServiceUnavailableException('Authentication is not configured');
    let identity: AuthenticatedUser;
    try { identity = await this.verify(token); }
    catch { throw new UnauthorizedException('Invalid or expired access token'); }

    const email = identity.email.trim().toLowerCase();
    const profile = await this.prisma.profile.upsert({
      where: { id: identity.id },
      create: { id: identity.id, email },
      update: { email },
      select: { id: true, email: true, role: true },
    });
    return profile;
  }
}
