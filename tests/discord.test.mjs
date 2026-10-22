import test from 'node:test';
import assert from 'node:assert/strict';
import { createDiscordService } from '../lib/discord-service.mjs';

const ORIGIN = 'https://helix-test.vercel.app';
const env = { SITE_ORIGIN: ORIGIN, DISCORD_CLIENT_ID: '123456789012345678', DISCORD_CLIENT_SECRET: 'test-only-private-discord-client-secret', SESSION_SECRET: 'test-only-session-signing-key-with-enough-entropy-for-fixtures', DISCORD_INVITE_URL: 'https://discord.gg/example' };
const req = (path, options = {}) => new Request(ORIGIN + path, options);
const cookiePart = value => value.split(';')[0];
function fixture(user = { id: '234567890123456789', username: 'player', global_name: 'Player' }) {
  let time = Date.now();
  const calls = [];
  const service = createDiscordService({ now: () => time, fetch: async (url, options = {}) => {
    calls.push({ url, options });
    if (url.includes('/oauth2/token')) return Response.json({ access_token: 'test-only-user-access-token', token_type: 'Bearer' });
    if (url.endsWith('/users/@me')) return Response.json(user);
    if (url.includes('/invites/')) return Response.json({ guild: { name: 'Helix Client' }, approximate_member_count: 7, approximate_presence_count: 6 });
    throw Error('Unexpected outbound request');
  } });
  return { service, calls, advance: milliseconds => { time += milliseconds; } };
}
async function start(f, next = 'dashboard') {
  const login = await f.service.handle(req('/api/discord/login?next=' + next), env);
  const url = new URL(login.headers.get('location'));
  return { login, url, state: url.searchParams.get('state'), cookie: cookiePart(login.headers.getSetCookie()[0]) };
}
async function finish(f, flow, extra = '') {
  return f.service.handle(req('/api/discord/callback?code=test-code&state=' + flow.state + extra, { headers: { Cookie: flow.cookie } }), env);
}
async function authenticated(f) {
  const flow = await start(f);
  const callback = await finish(f, flow, '&iss=https%3A%2F%2Fdiscord.com');
  return cookiePart(callback.headers.getSetCookie().find(value => value.startsWith('__Host-helix_session=')));
}
test('anonymous status never invents an identity', async () => {
  const f = fixture();
  const response = await f.service.handle(req('/api/discord/session'), env);
  assert.deepEqual(await response.json(), { configured: true, account: null });
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
});
test('missing client secret keeps login unavailable', async () => {
  const f = fixture();
  const response = await f.service.handle(req('/api/discord/login'), { ...env, DISCORD_CLIENT_SECRET: '' });
  assert.equal(response.headers.get('location'), ORIGIN + '/#/dashboard?auth=setup');
  assert.equal(f.calls.length, 0);
});
test('login requests only identify and uses the exact callback', async () => {
  const f = fixture(), flow = await start(f, 'downloads');
  assert.equal(flow.url.origin, 'https://discord.com');
  assert.equal(flow.url.searchParams.get('scope'), 'identify');
  assert.equal(flow.url.searchParams.get('redirect_uri'), ORIGIN + '/api/discord/callback');
  assert.ok(flow.state.length > 30);
  const cookie = flow.login.headers.getSetCookie()[0];
  for (const flag of ['__Host-', 'Secure', 'HttpOnly', 'SameSite=Lax', 'Path=/', 'Max-Age=600']) assert.ok(cookie.includes(flag));
  assert.equal(cookie.includes('Domain='), false);
});
test('successful callback creates an identity-only session and clears state', async () => {
  const f = fixture(), flow = await start(f, 'downloads'), response = await finish(f, flow);
  assert.equal(response.headers.get('location'), ORIGIN + '/#/downloads');
  const cookies = response.headers.getSetCookie();
  assert.ok(cookies.some(c => c.startsWith('__Host-helix_oauth_state=;') && c.includes('Max-Age=0')));
  const session = cookies.find(c => c.startsWith('__Host-helix_session='));
  assert.ok(session.includes('Max-Age=604800'));
  assert.equal(session.includes('test-only-user-access-token'), false);
  assert.equal(session.includes(env.DISCORD_CLIENT_SECRET), false);
  const status = await f.service.handle(req('/api/discord/session', { headers: { Cookie: cookiePart(session) } }), env);
  assert.deepEqual((await status.json()).account, { id: '234567890123456789', username: 'player', displayName: 'Player' });
  assert.equal(f.calls[0].options.body.get('redirect_uri'), ORIGIN + '/api/discord/callback');
  assert.equal(f.calls[0].options.headers['Content-Type'], 'application/x-www-form-urlencoded');
});
test('login state binds callbacks to the initiating browser', async () => {
  const f = fixture(), flow = await start(f);
  const response = await f.service.handle(req('/api/discord/callback?code=test&state=' + flow.state), env);
  assert.match(response.headers.get('location'), /auth=expired$/);
  assert.equal(f.calls.length, 0);
});
test('wrong state and expired state cannot exchange tokens', async () => {
  const f = fixture(), flow = await start(f);
  const wrong = await f.service.handle(req('/api/discord/callback?code=test&state=wrong', { headers: { Cookie: flow.cookie } }), env);
  assert.match(wrong.headers.get('location'), /auth=expired$/);
  f.advance(601000);
  assert.match((await finish(f, flow)).headers.get('location'), /auth=expired$/);
  assert.equal(f.calls.length, 0);
});
test('cancelled authorization and wrong issuer do not authenticate', async () => {
  const f = fixture(), flow = await start(f);
  const cancelled = await f.service.handle(req('/api/discord/callback?error=access_denied&state=' + flow.state, { headers: { Cookie: flow.cookie } }), env);
  assert.match(cancelled.headers.get('location'), /auth=cancelled$/);
  assert.match((await finish(f, flow, '&iss=https%3A%2F%2Fevil.example')).headers.get('location'), /auth=failed$/);
  assert.equal(f.calls.length, 0);
});
test('only fixed dashboard/download return locations are accepted', async () => {
  const f = fixture(), flow = await start(f, 'https://evil.example');
  assert.equal((await finish(f, flow)).headers.get('location'), ORIGIN + '/#/dashboard');
});
test('bad Discord identities never produce sessions', async () => {
  const f = fixture({ id: 'not-an-id', username: 'player' }), response = await finish(f, await start(f));
  assert.match(response.headers.get('location'), /auth=failed$/);
  assert.equal(response.headers.getSetCookie().some(c => c.startsWith('__Host-helix_session=')), false);
});
test('token exchange failure is recoverable without leaking its body', async () => {
  const f = fixture();
  const service = createDiscordService({ fetch: async () => new Response('private-provider-error', { status: 400 }) });
  const login = await service.handle(req('/api/discord/login'), env);
  const state = new URL(login.headers.get('location')).searchParams.get('state');
  const response = await service.handle(req('/api/discord/callback?code=x&state=' + state, { headers: { Cookie: cookiePart(login.headers.getSetCookie()[0]) } }), env);
  assert.match(response.headers.get('location'), /auth=failed$/);
  assert.equal((await response.text()).includes('private-provider-error'), false);
});
test('session expiration, signature tampering and key changes are rejected', async () => {
  const f = fixture(), session = await authenticated(f);
  const changed = session.replace('=', '=X');
  assert.equal((await (await f.service.handle(req('/api/discord/session', { headers: { Cookie: changed } }), env)).json()).account, null);
  assert.equal((await (await f.service.handle(req('/api/discord/session', { headers: { Cookie: session } }), { ...env, SESSION_SECRET: 'another-test-key-with-a-different-signature' })).json()).account, null);
  f.advance(604801000);
  assert.equal((await (await f.service.handle(req('/api/discord/session', { headers: { Cookie: session } }), env)).json()).account, null);
});
test('logout checks origin and expires the host-scoped session', async () => {
  const f = fixture();
  assert.equal((await f.service.handle(req('/api/discord/logout', { method: 'POST', headers: { Origin: 'https://evil.example' } }), env)).status, 403);
  const response = await f.service.handle(req('/api/discord/logout', { method: 'POST', headers: { Origin: ORIGIN } }), env);
  assert.equal(response.status, 204);
  assert.match(response.headers.getSetCookie()[0], /Max-Age=0/);
});
test('community uses real invite counts with short caching', async () => {
  const f = fixture();
  const responses = await Promise.all([f.service.handle(req('/api/discord/community'), env), f.service.handle(req('/api/discord/community'), env)]);
  assert.deepEqual(await responses[0].json(), { available: true, members: 7, online: 6, name: 'Helix Client', invite: 'https://discord.gg/example' });
  assert.equal(f.calls.length, 1);
  assert.ok(f.calls[0].url.endsWith('?with_counts=true'));
  f.advance(61000);
  await f.service.handle(req('/api/discord/community'), env);
  assert.equal(f.calls.length, 2);
});
test('community rejects arbitrary hosts and handles Discord outages', async () => {
  const f = fixture();
  assert.deepEqual(await (await f.service.handle(req('/api/discord/community'), { ...env, DISCORD_INVITE_URL: 'https://evil.example/private' })).json(), { available: false });
  assert.equal(f.calls.length, 0);
  const failed = createDiscordService({ fetch: async () => { throw Error('Offline'); } });
  assert.deepEqual(await (await failed.handle(req('/api/discord/community'), env)).json(), { available: false });
});
test('unknown routes do not expose configuration', async () => {
  const f = fixture();
  assert.equal(await f.service.handle(req('/'), env), null);
  const response = await f.service.handle(req('/api/discord/config'), env);
  assert.equal(response.status, 404);
  assert.equal((await response.text()).includes(env.DISCORD_CLIENT_SECRET), false);
});
