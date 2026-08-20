import assert from 'node:assert/strict';
import test from 'node:test';
import { chooseCapabilityTier } from './capability-tier.ts';

test('uses tier A for reduced motion, save-data, or constrained hardware', () => {
  assert.equal(chooseCapabilityTier({ reducedMotion: true, saveData: false, width: 1440, dpr: 2, cores: 8, memory: 8 }), 'A');
  assert.equal(chooseCapabilityTier({ reducedMotion: false, saveData: true, width: 1440, dpr: 2, cores: 8, memory: 8 }), 'A');
  assert.equal(chooseCapabilityTier({ reducedMotion: false, saveData: false, width: 390, dpr: 3, cores: 2, memory: 2 }), 'A');
});

test('reserves tier C for capable desktop devices', () => {
  assert.equal(chooseCapabilityTier({ reducedMotion: false, saveData: false, width: 1440, dpr: 2, cores: 8, memory: 8 }), 'C');
  assert.equal(chooseCapabilityTier({ reducedMotion: false, saveData: false, width: 900, dpr: 1, cores: 4, memory: 4 }), 'B');
});
