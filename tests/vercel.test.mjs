import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/index.mjs';
import { readFileSync } from 'node:fs';
import { securityHeaders } from '../lib/security.mjs';

const origin = 'https://helix-test.vercel.app';
const keys = ['SITE_ORIGIN', 'DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET', 'SESSION_SECRET'];
const fixture = { SITE_ORIGIN: origin, DISCORD_CLIENT_ID: '123456789012345678', DISCORD_CLIENT_SECRET: 'test-only-vercel-client-secret', SESSION_SECRET: 'test-only-vercel-session-secret-at-least-32-characters' };
async function configured(run) {
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  Object.assign(process.env, fixture);
  try { await run(); } finally {
    for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; }
  }
}

test('rewritten session route returns configured anonymous identity', () => configured(async () => {
  const response = await handler.fetch(new Request(origin + '/api?__discord_action=session'));
  assert.deepEqual(await response.json(), { configured: true, account: null });
  assert.match(response.headers.get('cache-control'), /no-store/);
}));
test('rewrite retains return query and uses the new production callback', () => configured(async () => {
  const response = await handler.fetch(new Request(origin + '/api?__discord_action=login&next=downloads'));
  const redirect = new URL(response.headers.get('location'));
  assert.equal(redirect.searchParams.get('redirect_uri'), origin + '/api/discord/callback');
  assert.equal(redirect.searchParams.get('scope'), 'identify');
  assert.match(response.headers.get('set-cookie'), /Secure; HttpOnly; SameSite=Lax/);
  const payload = JSON.parse(Buffer.from(response.headers.get('set-cookie').split('=')[1].split('.')[0], 'base64url'));
  assert.equal(payload.next, 'downloads');
}));
test('original request paths work if Vercel retains the source pathname', () => configured(async () => {
  const response = await handler.fetch(new Request(origin + '/api/discord/session'));
  assert.equal((await response.json()).configured, true);
}));
test('callback without browser state fails safely on the Vercel origin', () => configured(async () => {
  const response = await handler.fetch(new Request(origin + '/api?__discord_action=callback&code=test-code&state=invalid'));
  assert.equal(response.headers.get('location'), origin + '/#/dashboard?auth=expired');
}));
test('logout preserves origin enforcement through the rewrite', () => configured(async () => {
  const denied = await handler.fetch(new Request(origin + '/api?__discord_action=logout', { method: 'POST', headers: { Origin: 'https://elsewhere.example' } }));
  assert.equal(denied.status, 403);
  const response = await handler.fetch(new Request(origin + '/api?__discord_action=logout', { method: 'POST', headers: { Origin: origin } }));
  assert.equal(response.status, 204);
  assert.match(response.headers.get('set-cookie'), /Max-Age=0/);
}));
test('missing production origin fails closed instead of returning to the Sites domain', () => configured(async () => {
  delete process.env.SITE_ORIGIN;
  const response = await handler.fetch(new Request(origin + '/api?__discord_action=login'));
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('location'), null);
}));
test('unknown routes remain unavailable', async () => {
  assert.equal((await handler.fetch(new Request(origin + '/api?__discord_action=config'))).status, 404);
});
test('injector rewrite rejects anonymous metadata, download and identity spoofing', () => configured(async () => {
  for (const action of ['status', 'download']) {
    const response = await handler.fetch(new Request(origin + '/api?__injector_action=' + action, { headers: { 'x-discord-id': '1425462441495625768' } }));
    assert.equal(response.status, 401);
  }
}));

test('Vercel static responses and function responses share the same security policy', () => configured(async () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const headers = Object.fromEntries(config.headers.find(rule => rule.source === '/(.*)').headers.map(header => [header.key, header.value]));
  assert.deepEqual(headers, securityHeaders);
  for (const url of ['/api?__discord_action=session', '/api?__discord_action=unknown']) {
    const result = await handler.fetch(new Request(origin + url));
    assert.equal(result.headers.get('content-security-policy'), securityHeaders['Content-Security-Policy']);
    assert.equal(result.headers.get('access-control-allow-origin'), null);
  }
}));

test('injector rewrite fails closed on invalid production origin', () => configured(async () => {
  process.env.SITE_ORIGIN = origin + '/path';
  const result = await handler.fetch(new Request(origin + '/api?__injector_action=status'));
  assert.equal(result.status, 503);
}));
