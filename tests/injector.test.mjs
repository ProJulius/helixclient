import test from 'node:test';
import assert from 'node:assert/strict';
import { createInjectorService, INJECTOR_ADMIN_ID, INJECTOR_MAX_BYTES } from '../lib/injector-service.mjs';
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
