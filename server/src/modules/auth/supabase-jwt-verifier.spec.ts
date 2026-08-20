import { createSupabaseJwtVerifier, type VerifyFunction } from './supabase-jwt-verifier.js';

describe('Supabase JWT verifier', () => {
  const config = { supabaseUrl: 'https://project.supabase.co', audience: 'authenticated' };

  it('accepts verified authenticated claims and returns trusted identity', async () => {
    let receivedOptions: unknown;
    const verify: VerifyFunction = async (_token, _key, options) => {
      receivedOptions = options;
      return { payload: {
        sub: '4e8f6f86-68af-4e6c-9154-e670035436a1',
        email: 'buyer@example.com',
        aud: 'authenticated',
        iss: 'https://project.supabase.co/auth/v1',
        exp: Math.floor(Date.now() / 1000) + 300,
      } };
    };
    const verifier = createSupabaseJwtVerifier(config, verify);

    await expect(verifier('signed-token')).resolves.toEqual({
      id: '4e8f6f86-68af-4e6c-9154-e670035436a1',
      email: 'buyer@example.com',
    });
    expect(receivedOptions).toEqual({
      issuer: 'https://project.supabase.co/auth/v1',
      audience: 'authenticated',
    });
  });

  it('rejects tokens without a UUID subject or email', async () => {
    const verifier = createSupabaseJwtVerifier(config, async () => ({ payload: { sub: 'attacker' } }));
    await expect(verifier('token')).rejects.toThrow('INVALID_TOKEN_CLAIMS');
  });

  it('uses the project JWKS endpoint', async () => {
    let jwksUrl = '';
    createSupabaseJwtVerifier(config, async () => ({ payload: {} }), (url) => {
      jwksUrl = url.toString();
      return (() => undefined) as never;
    });
    expect(jwksUrl).toBe('https://project.supabase.co/auth/v1/.well-known/jwks.json');
  });
});
