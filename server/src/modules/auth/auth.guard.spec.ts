import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { SupabaseAuthGuard, SellerGuard, extractBearerToken } from './auth.guard.js';

describe('authentication guards', () => {
  it('extracts only a non-empty Bearer token', () => {
    expect(extractBearerToken('Bearer signed.jwt')).toBe('signed.jwt');
    expect(() => extractBearerToken(undefined)).toThrow(UnauthorizedException);
    expect(() => extractBearerToken('Basic abc')).toThrow(UnauthorizedException);
    expect(() => extractBearerToken('Bearer   ')).toThrow(UnauthorizedException);
  });

  it('attaches a database-backed profile to the request', async () => {
    const profile = { id: '4e8f6f86-68af-4e6c-9154-e670035436a1', email: 'buyer@example.com', role: 'CUSTOMER' as const };
    const authenticate = jest.fn<(token: string) => Promise<typeof profile>>().mockResolvedValue(profile);
    const guard = new SupabaseAuthGuard({ authenticate } as never);
    const request = { headers: { authorization: 'Bearer signed.jwt' } } as { headers: { authorization: string }; user?: typeof profile };
    const context = { switchToHttp: () => ({ getRequest: () => request }) } as never;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(authenticate).toHaveBeenCalledWith('signed.jwt');
    expect(request.user).toEqual(profile);
  });

  it('allows only the server-loaded SELLER role', () => {
    const guard = new SellerGuard();
    const contextFor = (role?: 'CUSTOMER' | 'SELLER') => ({
      switchToHttp: () => ({ getRequest: () => ({ user: role ? { role } : undefined }) }),
    }) as never;
    expect(guard.canActivate(contextFor('SELLER'))).toBe(true);
    expect(() => guard.canActivate(contextFor('CUSTOMER'))).toThrow(ForbiddenException);
    expect(() => guard.canActivate(contextFor())).toThrow(UnauthorizedException);
  });
});
