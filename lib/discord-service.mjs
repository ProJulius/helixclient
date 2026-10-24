// Discord identity follows the older Helix service's signed-cookie approach.
// OAuth tokens and application secrets stay on the server and are never stored in cookies.
const DEFAULT_ORIGIN = 'https://helix.invalid';
const DEFAULT_INVITE = 'https://discord.gg/9EmjevPykx';
const SESSION_AGE = 7 * 24 * 60 * 60;
const STATE_AGE = 10 * 60;
const SESSION_COOKIE = '__Host-helix_session';
const STATE_COOKIE = '__Host-helix_oauth_state';
const encoder = new TextEncoder();

function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}
function decode64(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw Error('Invalid encoding');
  return Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), char => char.charCodeAt(0));
}
function cookie(request, name) {
  return request.headers.get('cookie')?.split(';').map(v => v.trim()).find(v => v.startsWith(name + '='))?.slice(name.length + 1) || '';
}
function setCookie(name, value, age) {
  return `${name}=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${age}`;
}
function json(data, status = 200, extraHeaders = {}) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', ...extraHeaders } });
}
function redirect(location, cookies = []) {
  const headers = new Headers({ Location: location, 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' });
  cookies.forEach(value => headers.append('Set-Cookie', value));
  return new Response(null, { status: 302, headers });
}
function settings(env) {
  let origin = DEFAULT_ORIGIN;
  try { const url = new URL(env.SITE_ORIGIN || DEFAULT_ORIGIN); if (url.protocol === 'https:') origin = url.origin; } catch {}
  return { origin, clientId: env.DISCORD_CLIENT_ID || '', clientSecret: env.DISCORD_CLIENT_SECRET || '', sessionSecret: env.SESSION_SECRET || '', invite: env.DISCORD_INVITE_URL || DEFAULT_INVITE };
}
function ready(config) {
  return /^\d{17,20}$/.test(config.clientId) && config.clientSecret.length >= 16 && config.sessionSecret.length >= 32;
}
async function key(secret) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
async function sign(data, secret) {
  const payload = base64url(encoder.encode(JSON.stringify(data)));
  const signature = await crypto.subtle.sign('HMAC', await key(secret), encoder.encode(payload));
  return payload + '.' + base64url(new Uint8Array(signature));
}
async function verify(value, secret, kind, now) {
  try {
    if (!secret || secret.length < 32 || !value || value.length > 4096) return null;
    const [data, signature, extra] = value.split('.');
    if (!data || !signature || extra !== undefined) return null;
    if (!await crypto.subtle.verify('HMAC', await key(secret), decode64(signature), encoder.encode(data))) return null;
    const payload = JSON.parse(new TextDecoder().decode(decode64(data)));
    if (payload.kind !== kind || payload.v !== 1 || !Number.isInteger(payload.exp) || payload.exp <= now) return null;
    if (payload.exp > now + (kind === 'session' ? SESSION_AGE : STATE_AGE) + 60) return null;
    return payload;
  } catch { return null; }
}

export function createDiscordService(dependencies = {}) {
  const fetcher = dependencies.fetch || globalThis.fetch.bind(globalThis);
  const now = () => Math.floor((dependencies.now ? dependencies.now() : Date.now()) / 1000);
  let communityCache = null;
  let communityRequest = null;
  async function account(request, config) {
    const value = await verify(cookie(request, SESSION_COOKIE), config.sessionSecret, 'session', now());
    if (!value || value.aud !== config.origin || !/^\d{17,20}$/.test(value.id) || typeof value.username !== 'string' || value.username.length > 80) return null;
    return { id: value.id, username: value.username, displayName: typeof value.displayName === 'string' ? value.displayName : value.username };
  }
  async function community(config) {
    let code;
    try {
      const invite = new URL(config.invite);
      const match = invite.hostname === 'discord.gg' ? invite.pathname.match(/^\/([A-Za-z0-9-]+)\/?$/) : invite.hostname === 'discord.com' ? invite.pathname.match(/^\/invite\/([A-Za-z0-9-]+)\/?$/) : null;
      if (invite.protocol !== 'https:' || !match) return { available: false };
      code = match[1];
    } catch { return { available: false }; }
    if (communityCache?.code === code && communityCache.until > now()) return communityCache.data;
    if (communityRequest) return communityRequest;
    communityRequest = (async () => {
      let data = { available: false };
      try {
        const response = await fetcher(`https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true`, { signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json' } });
        if (response.ok) {
          const invite = await response.json();
          if (invite.guild && Number.isInteger(invite.approximate_member_count) && invite.approximate_member_count >= 0 && Number.isInteger(invite.approximate_presence_count) && invite.approximate_presence_count >= 0) {
            data = { available: true, members: invite.approximate_member_count, online: invite.approximate_presence_count, name: String(invite.guild.name || 'Helix Client').slice(0, 100), invite: `https://discord.gg/${code}` };
          }
        } else console.warn('Discord community request failed', { status: response.status });
      } catch (error) { console.warn('Discord community request failed', { name: error?.name, message: String(error?.message || '').slice(0, 200) }); }
      communityCache = { code, until: now() + (data.available ? 60 : 15), data };
      return data;
    })();
    try { return await communityRequest; } finally { communityRequest = null; }
  }
  async function handle(request, env) {
    const url = new URL(request.url);
    const config = settings(env);
    const path = url.pathname;
    if (!path.startsWith('/api/discord/')) return null;
    if (path === '/api/discord/community' && request.method === 'GET') {
      const data = await community(config);
      return json(data, 200, { 'Cache-Control': 'public, max-age=' + (data.available ? 60 : 15) });
    }
    if (path === '/api/discord/session' && request.method === 'GET') {
      return json({ configured: ready(config), account: await account(request, config) });
    }
    if (path === '/api/discord/login' && request.method === 'GET') {
      if (!ready(config)) return redirect(config.origin + '/#/dashboard?auth=setup');
      const next = url.searchParams.get('next') === 'downloads' ? 'downloads' : 'dashboard';
      const state = base64url(crypto.getRandomValues(new Uint8Array(32)));
      const stateCookie = await sign({ kind: 'state', v: 1, state, next, aud: config.origin, exp: now() + STATE_AGE }, config.sessionSecret);
      const params = new URLSearchParams({ client_id: config.clientId, response_type: 'code', scope: 'identify', state, redirect_uri: config.origin + '/api/discord/callback' });
      return redirect('https://discord.com/oauth2/authorize?' + params, [setCookie(STATE_COOKIE, stateCookie, STATE_AGE)]);
    }
    if (path === '/api/discord/callback' && request.method === 'GET') {
      const clearState = setCookie(STATE_COOKIE, '', 0);
      const failure = reason => redirect(config.origin + '/#/dashboard?auth=' + reason, [clearState]);
      if (!ready(config)) return failure('setup');
      const state = await verify(cookie(request, STATE_COOKIE), config.sessionSecret, 'state', now());
      if (!state || state.aud !== config.origin || state.state !== url.searchParams.get('state')) return failure('expired');
      if (url.searchParams.has('error')) return failure('cancelled');
      if (url.searchParams.has('iss') && url.searchParams.get('iss') !== 'https://discord.com') return failure('failed');
      const code = url.searchParams.get('code');
      if (!code || code.length > 2048) return failure('failed');
      try {
        const tokenResponse = await fetcher('https://discord.com/api/oauth2/token', { method: 'POST', signal: AbortSignal.timeout(10000), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret, grant_type: 'authorization_code', code, redirect_uri: config.origin + '/api/discord/callback' }) });
        if (!tokenResponse.ok) return failure('failed');
        const token = await tokenResponse.json();
        if (typeof token.access_token !== 'string' || token.token_type?.toLowerCase() !== 'bearer') return failure('failed');
        const userResponse = await fetcher('https://discord.com/api/v10/users/@me', { signal: AbortSignal.timeout(10000), headers: { Authorization: 'Bearer ' + token.access_token } });
        if (!userResponse.ok) return failure('failed');
        const user = await userResponse.json();
        if (!/^\d{17,20}$/.test(user.id) || typeof user.username !== 'string' || !user.username.length || user.username.length > 80) return failure('failed');
        const session = await sign({ kind: 'session', v: 1, id: user.id, username: user.username, displayName: String(user.global_name || user.username).slice(0, 80), aud: config.origin, exp: now() + SESSION_AGE }, config.sessionSecret);
        return redirect(config.origin + '/#/' + (state.next === 'downloads' ? 'downloads' : 'dashboard'), [clearState, setCookie(SESSION_COOKIE, session, SESSION_AGE)]);
      } catch { return failure('failed'); }
    }
    if (path === '/api/discord/logout' && request.method === 'POST') {
      if (request.headers.get('origin') !== config.origin) return json({ error: 'Request origin rejected.' }, 403);
      return new Response(null, { status: 204, headers: { 'Cache-Control': 'private, no-store', 'Set-Cookie': setCookie(SESSION_COOKIE, '', 0) } });
    }
    return json({ error: 'Not found.' }, 404);
  }
  return { handle, getAccount: (request, env) => account(request, settings(env)) };
}
