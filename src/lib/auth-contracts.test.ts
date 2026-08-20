import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('Supabase auth routes and persistent provider are wired into the Pages Router', () => {
  const app = read('src/pages/_app.tsx');
  const provider = read('src/context/AuthContext.tsx');
  const signIn = read('src/pages/auth/sign-in.tsx');
  const signUp = read('src/pages/auth/sign-up.tsx');
  const reset = read('src/pages/auth/reset-password.tsx');

  assert.match(app, /AuthProvider/);
  assert.match(provider, /onAuthStateChange/);
  assert.match(signIn, /signInWithPassword/);
  assert.match(signUp, /signUp/);
  assert.match(reset, /resetPasswordForEmail/);
});

test('public environment never contains privileged Supabase or Stripe keys', () => {
  const example = read('.env.example');
  assert.doesNotMatch(example, /NEXT_PUBLIC_(?:SUPABASE_SERVICE_ROLE|STRIPE_SECRET)/);
  assert.match(example, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
});
