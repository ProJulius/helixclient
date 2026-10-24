import test from 'node:test';
import assert from 'node:assert/strict';
import { createApiGuard, securityHeaders, withSecurityHeaders, validSiteOrigin, readLimitedJson, exactUploadStream } from '../lib/security.mjs';

const origin = 'https://helix.example';
const env = { SITE_ORIGIN: origin };
const request = (path, options) => new Request(origin + path, options);

test('security headers block injected scripts while preserving cookies and download headers', () => {
  const headers = new Headers({ 'Content-Disposition': 'attachment; filename="Helix.exe"' });
  headers.append('Set-Cookie', 'one=1; Secure; HttpOnly');
  headers.append('Set-Cookie', 'two=2; Secure; HttpOnly');
  const response = withSecurityHeaders(new Response('file', { headers }));
  assert.deepEqual(response.headers.getSetCookie(), headers.getSetCookie());
  assert.match(response.headers.get('content-security-policy'), /script-src 'self';/);
  assert.match(response.headers.get('content-security-policy'), /script-src-attr 'none'/);
  assert.match(response.headers.get('content-security-policy'), /object-src 'none'/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.match(response.headers.get('content-disposition'), /attachment/);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
  assert.ok(securityHeaders['Strict-Transport-Security']);
});

test('production origin accepts only a bare HTTPS origin', () => {
  for (const value of ['', 'http://helix.example', origin + '/path', origin + '?q=1', 'https://user:pass@helix.example', origin + '#home']) assert.equal(validSiteOrigin(value), null);
  assert.equal(validSiteOrigin(origin + '/'), origin);
});

test('API guard limits login requests and ignores spoofable client identity headers', async () => {
  let time = 0;
  const guard = createApiGuard({ platform: 'vercel', now: () => time });
  for (let i = 0; i < 10; i++) assert.equal(await guard(request('/api/discord/login', { headers: { 'x-discord-id': String(i), 'x-forwarded-for': String(i), 'x-vercel-forwarded-for': '192.0.2.1' } }), env), null);
  const denied = await guard(request('/api/discord/login', { headers: { 'x-vercel-forwarded-for': '192.0.2.1' } }), env);
  assert.equal(denied.status, 429);
  assert.equal(denied.headers.get('retry-after'), '60');
  assert.equal(await guard(request('/api/discord/login', { headers: { 'x-vercel-forwarded-for': '192.0.2.2' } }), env), null);
  time = 60001;
  assert.equal(await guard(request('/api/discord/login', { headers: { 'x-vercel-forwarded-for': '192.0.2.1' } }), env), null);
});

test('signed-in download limits follow the verified account across IP changes', async () => {
  const guard = createApiGuard({ platform: 'vercel', getAccount: async () => ({ id: '123456789012345678' }) });
  for (let i = 0; i < 12; i++) assert.equal(await guard(request('/api/injector/download', { headers: { 'x-vercel-forwarded-for': '192.0.2.' + i } }), env), null);
  assert.equal((await guard(request('/api/injector/download'), env)).status, 429);
});

test('API guard rejects foreign origins and methods without interfering with OAuth navigation or signed callbacks', async () => {
  const guard = createApiGuard({ platform: 'vercel' });
  assert.equal((await guard(request('/api/injector', { headers: { Origin: 'https://evil.example' } }), env)).status, 403);
  assert.equal((await guard(request('/api/discord/session', { headers: { 'Sec-Fetch-Site': 'cross-site' } }), env)).status, 403);
  assert.equal((await guard(request('/api/discord/session', { method: 'POST' }), env)).status, 405);
  assert.equal(await guard(request('/api/discord/callback', { headers: { 'Sec-Fetch-Site': 'cross-site' } }), env), null);
  assert.equal(await guard(request('/api/injector/upload', { method: 'POST', headers: { 'x-vercel-signature': 'fake-signature-still-verified-by-sdk' } }), env), null);
  assert.equal((await guard(request('/api/discord/session'), { SITE_ORIGIN: origin + '/bad' })).status, 503);
});

test('rate-limit state is bounded and expired keys can be reused', async () => {
  let time = 0;
  const guard = createApiGuard({ platform: 'sites', maxKeys: 2, now: () => time });
  for (const ip of ['192.0.2.1', '192.0.2.2']) assert.equal(await guard(request('/api/discord/login', { headers: { 'cf-connecting-ip': ip } }), env), null);
  assert.equal((await guard(request('/api/discord/login', { headers: { 'cf-connecting-ip': '192.0.2.3' } }), env)).status, 429);
  time = 60001;
  assert.equal(await guard(request('/api/discord/login', { headers: { 'cf-connecting-ip': '192.0.2.3' } }), env), null);
});

test('JSON size limits count stream bytes even without Content-Length', async () => {
  const body = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('x'.repeat(200))); c.close(); } });
  const oversized = request('/api/injector/upload', { method: 'POST', body, duplex: 'half' });
  await assert.rejects(readLimitedJson(oversized, 100), /size/i);
  assert.deepEqual(await readLimitedJson(request('/x', { method: 'POST', body: '{"version":"ok"}' }), 100), { version: 'ok' });
});

test('binary uploads reject both understated and overstated Content-Length', async () => {
  for (const expected of [1, 3]) {
    const stream = new Response('ab').body.pipeThrough(exactUploadStream(expected));
    await assert.rejects(new Response(stream).arrayBuffer(), /size/i);
  }
  assert.equal(await new Response(new Response('ab').body.pipeThrough(exactUploadStream(2))).text(), 'ab');
});
