import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('backend Account profile producer includes the role required by the frontend consumer', () => {
  const producer = readFileSync('server/src/modules/account/account.service.ts', 'utf8');
  const consumer = readFileSync('src/lib/api/account.ts', 'utf8');

  assert.match(consumer, /role:\s*ProfileRole/);
  assert.match(producer, /profileSelect\s*=\s*\{[\s\S]*?role:\s*true[\s\S]*?\}/);
});
