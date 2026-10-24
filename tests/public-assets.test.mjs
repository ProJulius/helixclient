import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { checkPublicAssets } from '../scripts/check-public.mjs';

test('production packaging rejects environment files, source maps and sample-mode config', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'helix-public-check-'));
  try {
    writeFileSync(path.join(directory, 'index.html'), '<!doctype html><title>Helix</title>');
    assert.equal(checkPublicAssets(directory), 1);
    for (const name of ['.env.local', 'app.js.map', 'config.backup.txt']) {
      writeFileSync(path.join(directory, name), 'private');
      assert.throws(() => checkPublicAssets(directory), /public asset/);
      rmSync(path.join(directory, name));
    }
    writeFileSync(path.join(directory, 'config.js'), 'window.CONFIG = { DEV_SAMPLE_DATA: true };');
    assert.throws(() => checkPublicAssets(directory), /Sample data/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
