import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const read = (path: string) => readFileSync(path, 'utf8');

test('Seller Studio is bearer-protected, operational, and contains no WebGL', () => {
  const api = read('src/lib/api/studio.ts');
  const page = read('src/pages/studio/index.tsx');
  assert.match(api, /Authorization.*Bearer/);
  assert.match(api, /FormData/);
  assert.doesNotMatch(api, /role.*localStorage/i);
  assert.match(page, /createStudioProduct/);
  assert.match(page, /uploadStudioImage/);
  assert.doesNotMatch(page, /Three|WebGL|HeroScene/);
});
