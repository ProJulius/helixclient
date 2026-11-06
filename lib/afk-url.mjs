const SOURCE_URL = 'https://api.github.com/repos/cosmofn/helixafk/contents/url.txt?ref=main';

export function validateAfkUrl(value) {
  if (typeof value !== 'string') return null;
  const lines = value.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length !== 1) return null;
  try {
    const url = new URL(lines[0]);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.pathname !== '/' || url.search || url.hash || !/^[a-z0-9-]+\.trycloudflare\.com$/i.test(url.hostname)) return null;
    return url.origin;
  } catch { return null; }
}

function json(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
}

export function createAfkUrlService({ fetcher = fetch } = {}) {
  async function latestUrl(env) {
    const headers = {
      Accept: 'application/vnd.github.raw',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (env.AFK_GITHUB_TOKEN) headers.Authorization = 'Bearer ' + env.AFK_GITHUB_TOKEN;
    const response = await fetcher(SOURCE_URL, { headers, signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw Error('AFK URL source is unavailable');
    const destination = validateAfkUrl(await response.text());
    if (!destination) throw Error('AFK URL source is invalid');
    return destination;
  }

  return {
    async handle(request, env) {
      const url = new URL(request.url);
      if (url.pathname !== '/api/afk/url' && url.pathname !== '/api/afk/redirect') return null;
      if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405, { Allow: 'GET' });
      try {
        const destination = await latestUrl(env);
        if (url.pathname === '/api/afk/redirect') return new Response(null, { status: 302, headers: { Location: destination, 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } });
        return json({ url: destination }, 200, { 'Vercel-CDN-Cache-Control': 'public, s-maxage=5' });
      } catch {
        return json({ error: 'The Helix AFK site is temporarily unavailable.' }, 503);
      }
    }
  };
}
