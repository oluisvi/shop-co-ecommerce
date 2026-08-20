import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

export type AuthenticatedUser = Readonly<{ id: string; email: string }>;

type VerifyResult = { payload: JWTPayload };
export type VerifyFunction = (
  token: string,
  key: ReturnType<typeof createRemoteJWKSet>,
  options: { issuer: string; audience: string },
) => Promise<VerifyResult>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createSupabaseJwtVerifier(
  config: { supabaseUrl: string; audience: string },
  verify: VerifyFunction = jwtVerify,
  createJwks: typeof createRemoteJWKSet = createRemoteJWKSet,
) {
  const baseUrl = config.supabaseUrl.replace(/\/$/, '');
  const issuer = `${baseUrl}/auth/v1`;
  const jwks = createJwks(new URL(`${issuer}/.well-known/jwks.json`));

  return async (token: string): Promise<AuthenticatedUser> => {
    const { payload } = await verify(token, jwks, {
      issuer,
      audience: config.audience,
    });
    if (!payload.sub || !UUID.test(payload.sub) || typeof payload.email !== 'string') {
      throw new Error('INVALID_TOKEN_CLAIMS');
    }
    return { id: payload.sub, email: payload.email };
  };
}
