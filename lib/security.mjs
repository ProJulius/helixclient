// This site uses local scripts/fonts, Discord's public invite API, and private Blob uploads.
// Inline styles remain necessary for the existing theme and motion controls; scripts do not.
export const securityHeaders = Object.freeze({
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://discord.com https://vercel.com https://*.blob.vercel-storage.com; object-src 'none'; base-uri 'none'; form-action 'self'; frame-src 'none'; frame-ancestors 'self' https://chatgpt.com https://*.chatgpt.com; upgrade-insecure-requests",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Strict-Transport-Security': 'max-age=31536000',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'X-Permitted-Cross-Domain-Policies': 'none'
});

export function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(securityHeaders)) headers.set(name, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function validSiteOrigin(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash ? url.origin : null;
  } catch { return null; }
}

function securityError(message, status, headers = {}) {
  return Response.json({ error: message }, { status, headers: { 'Cache-Control': 'private, no-store', ...headers } });
}

// These counters protect one warm Worker/function instance. Configure the hosting WAF
// for limits shared across instances/regions; this is not a distributed rate limiter.
export function createApiGuard({ platform, getAccount, now = Date.now, maxKeys = 4096 } = {}) {
  const counters = new Map();
  const profiles = {
    login: [10, 60000], callback: [20, 60000], logout: [20, 60000],
    community: [60, 60000], session: [120, 60000],
    status: [120, 60000], upload: [12, 600000], download: [12, 60000]
  };
  function consume(key, limit, duration) {
    const time = now();
    let counter = counters.get(key);
    if (!counter || counter.until <= time) {
      if (counters.size >= maxKeys) {
        for (const [stored, entry] of counters) if (entry.until <= time) counters.delete(stored);
        if (counters.size >= maxKeys && !counters.has(key)) return 60;
      }
      counter = { count: 0, until: time + duration };
      counters.set(key, counter);
    }
    if (counter.count >= limit) return Math.max(1, Math.ceil((counter.until - time) / 1000));
    counter.count++;
    return 0;
  }
  return async (request, env) => {
    const path = new URL(request.url).pathname;
    const injector = path === '/api/injector' || path.startsWith('/api/injector/');
    if (!injector && !path.startsWith('/api/discord/')) return null;
    const action = path === '/api/injector' ? 'status' : path.split('/').at(-1);
    if (!Object.hasOwn(profiles, action)) return securityError('Not found.', 404);
    const method = action === 'logout' ? 'POST' : action === 'upload' ? (platform === 'vercel' ? 'POST' : 'PUT') : 'GET';
    if (request.method !== method) return securityError('Method not allowed.', 405, { Allow: method });
    const origin = validSiteOrigin(env.SITE_ORIGIN);
    if (!origin) return securityError('Configure a valid HTTPS SITE_ORIGIN.', 503);
    const callback = platform === 'vercel' && action === 'upload' && request.headers.has('x-vercel-signature');
    // OAuth returns are top-level navigation from Discord. Blob completion is authenticated
    // by the SDK signature, not by a browser Origin header or a Discord cookie.
    if (!['login', 'callback'].includes(action) && !callback) {
      if ((request.headers.has('origin') && request.headers.get('origin') !== origin) || request.headers.get('sec-fetch-site') === 'cross-site') return securityError('Request origin rejected.', 403);
    }
    const ip = request.headers.get(platform === 'vercel' ? 'x-vercel-forwarded-for' : 'cf-connecting-ip') || 'unknown';
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip.slice(0, 128)));
    const address = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    const [limit, duration] = callback ? [60, 60000] : profiles[action];
    let retry = consume('ip:' + action + ':' + address, limit, duration);
    if (!retry && injector && getAccount && !callback) {
      const user = await getAccount(request, env);
      if (user) retry = consume('account:' + action + ':' + user.id, limit, duration);
    }
    return retry ? securityError('Too many requests. Please try again shortly.', 429, { 'Retry-After': String(retry) }) : null;
  };
}

export class RequestSizeError extends Error {
  constructor() { super('Request size does not match the allowed size.'); }
}

export async function readLimitedJson(request, maxBytes) {
  if (Number(request.headers.get('content-length')) > maxBytes) throw new RequestSizeError();
  const reader = request.body?.getReader();
  if (!reader) throw Error('Missing body');
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new RequestSizeError(); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}

export function exactUploadStream(expectedBytes) {
  let size = 0;
  return new TransformStream({
    transform(chunk, controller) {
      size += chunk.byteLength;
      if (size > expectedBytes) throw new RequestSizeError();
      controller.enqueue(chunk);
    },
    flush() { if (size !== expectedBytes) throw new RequestSizeError(); }
  });
}
