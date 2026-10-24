import test from 'node:test';
import assert from 'node:assert/strict';
import { blobInjectorUpload } from '../lib/blob-injector.mjs';
const origin = 'https://helix.example';
const env = { SITE_ORIGIN: origin, BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_teststore_test-only-token' };
const request = body => new Request(origin + '/api/injector/upload', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
test('Blob upload stays unavailable until private storage is configured', async () => {
  const result = await blobInjectorUpload(request({}), { SITE_ORIGIN: origin }, async () => null);
  assert.equal(result.status, 503);
});
test('ordinary accounts cannot obtain Blob client upload tokens', async () => {
  const result = await blobInjectorUpload(request({ type: 'blob.generate-client-token', payload: { pathname: 'injector/releases/12345678-1234-1234-1234-123456789012/Helix.exe', clientPayload: '{}' } }), env, async () => ({ id: '123456789012345678' }));
  assert.equal(result.status, 403);
  assert.equal((await result.text()).includes(env.BLOB_READ_WRITE_TOKEN), false);
});
test('forged upload-completion callbacks cannot publish a file', async () => {
  const result = await blobInjectorUpload(request({ type: 'blob.upload-completed', payload: { blob: { pathname: 'injector/releases/forged/Helix.exe' }, tokenPayload: '{}' } }), env, async () => null);
  assert.equal(result.status, 403);
});
