import assert from 'node:assert/strict';
import test from 'node:test';
import { getAuthNavigation } from './auth-navigation.ts';
import * as authNavigation from './auth-navigation.ts';

test('guest account navigation leads to sign in without exposing Studio', () => {
  assert.deepEqual(getAuthNavigation({ authenticated: false, profileLoading: false, role: null }), {
    account: { href: '/auth/sign-in', label: 'Sign in' },
    studio: null,
  });
});

test('customer navigation leads to Account without exposing Studio', () => {
  assert.deepEqual(getAuthNavigation({ authenticated: true, profileLoading: false, role: 'CUSTOMER' }), {
    account: { href: '/account', label: 'Account' },
    studio: null,
  });
});

test('seller navigation preserves Account and adds Studio', () => {
  assert.deepEqual(getAuthNavigation({ authenticated: true, profileLoading: false, role: 'SELLER' }), {
    account: { href: '/account', label: 'Account' },
    studio: { href: '/studio', label: 'Studio' },
  });
});

test('unknown profile state never exposes Studio', () => {
  assert.equal(getAuthNavigation({ authenticated: true, profileLoading: true, role: 'SELLER' }).studio, null);
});

test('session changes invalidate stale privileged profile requests', () => {
  const createGuard = (authNavigation as typeof authNavigation & {
    createProfileRequestGuard?: () => { begin: () => number; invalidate: () => void; isCurrent: (request: number) => boolean };
  }).createProfileRequestGuard;
  assert.ok(createGuard, 'profile request guard must exist');
  const guard = createGuard();
  const sellerRequest = guard.begin();
  guard.invalidate();
  const customerRequest = guard.begin();

  assert.equal(guard.isCurrent(sellerRequest), false);
  assert.equal(guard.isCurrent(customerRequest), true);
});
