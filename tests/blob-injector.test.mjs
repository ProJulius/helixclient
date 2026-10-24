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

test('the real Blob SDK issues a scoped token only for an administrator release', async () => {
  const body = { type: 'blob.generate-client-token', payload: { pathname: 'injector/releases/12345678-1234-1234-1234-123456789012/Helix.exe', clientPayload: '{"version":"1.0.0"}', multipart: true } };
  const result = await blobInjectorUpload(request(body), env, async () => ({ id: '1425462441495625768' }));
  assert.equal(result.status, 200);
  const data = await result.json();
  assert.match(data.clientToken, /^vercel_blob_client_/);
  assert.equal(JSON.stringify(data).includes(env.BLOB_READ_WRITE_TOKEN), false);
  for (const pathname of ['injector/latest.json', '../Helix.exe', 'injector/releases/12345678-1234-1234-1234-123456789012/index.html']) {
    const denied = await blobInjectorUpload(request({ ...body, payload: { ...body.payload, pathname } }), env, async () => ({ id: '1425462441495625768' }));
    assert.equal(denied.status, 403);
  }
});

test('chunked oversized callback requests are rejected before parsing or SDK calls', async () => {
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('x'.repeat(16385))); controller.close(); } });
  const result = await blobInjectorUpload(new Request(origin + '/api/injector/upload', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-vercel-signature': 'invalid' }, body: stream, duplex: 'half' }), env, async () => null);
  assert.equal(result.status, 413);
});

test('spoofing a callback header cannot obtain a client token as a regular user', async () => {
  const req = request({ type: 'blob.generate-client-token', payload: { pathname: 'injector/releases/12345678-1234-1234-1234-123456789012/Helix.exe' } });
  req.headers.set('x-vercel-signature', 'not-a-real-signature');
  assert.equal((await blobInjectorUpload(req, env, async () => ({ id: '123456789012345678' }))).status, 403);
});
