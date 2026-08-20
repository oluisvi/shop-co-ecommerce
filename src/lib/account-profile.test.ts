import assert from 'node:assert/strict';
import test from 'node:test';
import { buildProfileUpdate } from './account-profile.ts';

test('profile updates trim names and clear empty phone values', () => {
  assert.deepEqual(buildProfileUpdate({
    firstName: '  Luis ',
    lastName: ' Vieira  ',
    phone: '   ',
  }), {
    firstName: 'Luis',
    lastName: 'Vieira',
    phone: null,
  });
});
