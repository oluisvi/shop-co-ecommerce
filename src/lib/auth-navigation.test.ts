import assert from 'node:assert/strict';
import test from 'node:test';
import { getAuthNavigation } from './auth-navigation.ts';

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
