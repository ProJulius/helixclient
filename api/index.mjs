import { createDiscordService } from '../lib/discord-service.mjs';

const discord = createDiscordService();
const actions = new Set(['community', 'session', 'login', 'callback', 'logout']);

// Vercel rewrites all Discord endpoints to this one Web Standard function.
export default {
  async fetch(request) {
    const url = new URL(request.url);
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
    return discord.handle(new Request(url, request), env);
  }
};
