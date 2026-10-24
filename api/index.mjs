import { createDiscordService } from '../lib/discord-service.mjs';
import { createInjectorService } from '../lib/injector-service.mjs';
import { blobInjectorStorage, blobInjectorUpload } from '../lib/blob-injector.mjs';
import { createApiGuard, withSecurityHeaders } from '../lib/security.mjs';

const discord = createDiscordService();
const injector = createInjectorService({ getAccount: discord.getAccount, getStorage: blobInjectorStorage });
const actions = new Set(['community', 'session', 'login', 'callback', 'logout']);
const guard = createApiGuard({ platform: 'vercel', getAccount: discord.getAccount });

// Vercel rewrites all Discord endpoints to this one Web Standard function.
export default {
  async fetch(request) {
    try { return withSecurityHeaders(await dispatch(request)); }
    catch { return withSecurityHeaders(Response.json({ error: 'Service temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'private, no-store' } })); }
  }
};

async function dispatch(request) {
    const url = new URL(request.url);
    const injectorAction = url.searchParams.get('__injector_action') || (url.pathname === '/api/injector' ? 'status' : url.pathname.match(/^\/api\/injector\/([a-z]+)$/)?.[1]);
    if (injectorAction) {
      if (!['status', 'upload', 'download'].includes(injectorAction)) return Response.json({ error: 'Not found.' }, { status: 404 });
      url.searchParams.delete('__injector_action');
      url.pathname = '/api/injector' + (injectorAction === 'status' ? '' : '/' + injectorAction);
      const forwarded = new Request(url, request);
      const blocked = await guard(forwarded, process.env);
      if (blocked) return blocked;
      if (injectorAction === 'upload' && request.method === 'POST') return blobInjectorUpload(forwarded, process.env, discord.getAccount);
      return injector.handle(forwarded, process.env);
    }
    const action = url.searchParams.get('__discord_action') || url.pathname.match(/^\/api\/discord\/([a-z]+)$/)?.[1];
    if (!actions.has(action)) return Response.json({ error: 'Not found.' }, { status: 404 });
    const env = process.env;
    if (action !== 'community') {
      try {
        const origin = new URL(env.SITE_ORIGIN || '');
        if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) throw Error();
      } catch {
        return Response.json({ error: 'Configure SITE_ORIGIN in Vercel environment variables.' }, { status: 503, headers: { 'Cache-Control': 'private, no-store' } });
      }
    }
    url.searchParams.delete('__discord_action');
    url.pathname = '/api/discord/' + action;
    const forwarded = new Request(url, request);
    const blocked = await guard(forwarded, env);
    return blocked || discord.handle(forwarded, env);
}
