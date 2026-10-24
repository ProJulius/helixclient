import test from 'node:test';
import assert from 'node:assert/strict';
import { createInjectorService, r2InjectorStorage, INJECTOR_ADMIN_ID, INJECTOR_MAX_BYTES } from '../lib/injector-service.mjs';
import { createDiscordService } from '../lib/discord-service.mjs';

const origin = 'https://helix.example';
const env = { SITE_ORIGIN: origin, ADMIN_DISCORD_ID: INJECTOR_ADMIN_ID };
const request = (path = '', init = {}) => new Request(origin + '/api/injector' + path, init);
function fixture(id = INJECTOR_ADMIN_ID) {
  let saved = null;
  let failWrite = false;
  const storage = {
    mode: 'server',
    async stat() { return saved?.release || null; },
    async write(body, release) {
      const bytes = await new Response(body).arrayBuffer();
      if (failWrite) throw Error('private-storage-credential');
      saved = { bytes, release: { ...release, size: bytes.byteLength } };
      return saved.release;
    },
    async read() { return saved ? { body: saved.bytes, release: saved.release } : null; }
  };
  return { service: createInjectorService({ getAccount: async () => id ? { id } : null, getStorage: () => storage }), fail: () => { failWrite = true; } };
}
const upload = (extra = {}, body = 'example-release') => request('/upload', { method: 'PUT', body, headers: { Origin: origin, 'Content-Length': String(Buffer.byteLength(body)), 'X-Injector-Filename': 'Helix-Injector.exe', 'X-Injector-Version': '1.0.0', ...extra } });

test('anonymous metadata, uploads and downloads are rejected', async () => {
  const f = fixture(null);
  for (const r of [request(), upload(), request('/download')]) assert.equal((await f.service.handle(r, env)).status, 401);
});
test('public identity headers cannot impersonate a Discord administrator', async () => {
  const service = createInjectorService({ getAccount: createDiscordService().getAccount });
  const r = request('/upload', { method: 'PUT', body: 'x', headers: { 'x-discord-id': INJECTOR_ADMIN_ID, 'oai-authenticated-user-id': INJECTOR_ADMIN_ID } });
  assert.equal((await service.handle(r, env)).status, 401);
});
test('non-admin accounts may see availability but cannot upload', async () => {
  const f = fixture('123456789012345678');
  assert.equal((await (await f.service.handle(request(), env)).json()).canUpload, false);
  assert.equal((await f.service.handle(upload(), env)).status, 403);
});
test('cross-origin uploads are rejected even for the administrator', async () => {
  assert.equal((await fixture().service.handle(upload({ Origin: 'https://evil.example' }), env)).status, 403);
});
test('admin uploads publish filename, version and bytes for signed-in downloads', async () => {
  const f = fixture();
  const result = await f.service.handle(upload(), env);
  assert.equal(result.status, 200);
  const metadata = await (await f.service.handle(request(), env)).json();
  assert.equal(metadata.canUpload, true); assert.equal(metadata.release.filename, 'Helix-Injector.exe');
  assert.equal(metadata.release.version, '1.0.0');
  const file = await f.service.handle(request('/download'), env);
  assert.equal(await file.text(), 'example-release');
  assert.equal(file.headers.get('content-type'), 'application/octet-stream');
  assert.match(file.headers.get('content-disposition'), /attachment/);
  assert.match(file.headers.get('cache-control'), /no-store/);
});
test('missing, empty and oversized lengths never publish', async () => {
  const f = fixture();
  for (const length of ['', '0', String(INJECTOR_MAX_BYTES + 1), 'invalid']) assert.equal((await f.service.handle(upload({ 'Content-Length': length }), env)).status, 413);
  assert.equal((await (await f.service.handle(request(), env)).json()).release, null);
});
test('path traversal, HTML files and header injection names are rejected', async () => {
  for (const name of ['../file.exe', 'index.html', 'bad"name.exe', 'dir/file.exe']) assert.equal((await fixture().service.handle(upload({ 'X-Injector-Filename': name }), env)).status, 400);
});
test('failed replacements preserve the previous release and hide provider errors', async () => {
  const f = fixture(); await f.service.handle(upload(), env); f.fail();
  const result = await f.service.handle(upload({ 'X-Injector-Version': '2.0.0' }), env);
  assert.equal(result.status, 503); assert.equal((await result.text()).includes('private-storage-credential'), false);
  assert.equal((await (await f.service.handle(request(), env)).json()).release.version, '1.0.0');
});
test('a subsequent successful upload replaces the previous release', async () => {
  const f = fixture(); await f.service.handle(upload(), env); await f.service.handle(upload({ 'X-Injector-Version': '2.0.0' }, 'updated-release'), env);
  assert.equal(await (await f.service.handle(request('/download'), env)).text(), 'updated-release');
  assert.equal((await (await f.service.handle(request(), env)).json()).release.version, '2.0.0');
});
test('missing storage and missing files have explicit unavailable states', async () => {
  const service = createInjectorService({ getAccount: async () => ({ id: INJECTOR_ADMIN_ID }), getStorage: () => null });
  assert.equal((await (await service.handle(request(), env)).json()).configured, false);
  assert.equal((await service.handle(upload(), env)).status, 503);
  assert.equal((await fixture().service.handle(request('/download'), env)).status, 404);
});

test('misstated stream lengths cannot replace an existing release', async () => {
  const f = fixture();
  await f.service.handle(upload(), env);
  for (const size of ['1', '999']) assert.equal((await f.service.handle(upload({ 'Content-Length': size }, 'updated'), env)).status, 413);
  assert.equal(await (await f.service.handle(request('/download'), env)).text(), 'example-release');
});

test('R2 receives the final Cloudflare fixed-length stream after byte validation', async () => {
  const original = globalThis.FixedLengthStream;
  let length;
  globalThis.FixedLengthStream = class extends TransformStream {
    constructor(size) { super(); length = size; this.readable.knownLength = size; }
  };
  try {
    const storage = r2InjectorStorage({ BUCKET: { async put(key, body) {
      assert.equal(body.knownLength, 2);
      assert.equal(await new Response(body).text(), 'ab');
      return { size: 2 };
    } } });
    const result = await storage.write(new Response('ab').body, { filename: 'Helix.exe', version: '', uploadedAt: new Date().toISOString(), size: 2 });
    assert.equal(length, 2);
    assert.equal(result.size, 2);
  } finally {
    if (original === undefined) delete globalThis.FixedLengthStream;
    else globalThis.FixedLengthStream = original;
  }
});

test('the 68.2 MiB release fits the limit and streams without buffering the file', async () => {
  const size = 71527927;
  const chunk = new Uint8Array(1048576);
  let remaining = size, received = 0;
  const body = new ReadableStream({ pull(controller) {
    if (!remaining) { controller.close(); return; }
    const count = Math.min(remaining, chunk.byteLength);
    controller.enqueue(chunk.subarray(0, count)); remaining -= count;
  } });
  const storage = { mode: 'server', async write(stream, metadata) {
    for await (const bytes of stream) received += bytes.byteLength;
    assert.equal(received, size);
    return { ...metadata, size: received };
  } };
  const service = createInjectorService({ getAccount: async () => ({ id: INJECTOR_ADMIN_ID }), getStorage: () => storage });
  const response = await service.handle(request('/upload', { method: 'PUT', body, duplex: 'half', headers: { Origin: origin, 'Content-Length': String(size), 'X-Injector-Filename': 'HelixInjector_1.0.6.exe' } }), env);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).release.size, size);
});
