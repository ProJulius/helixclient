import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createAfkUrlService, validateAfkUrl } from '../lib/afk-url.mjs';

const origin = 'https://helix-test.vercel.app';
const current = 'https://current-afk-test.trycloudflare.com';
const next = 'https://test-afk-target.trycloudflare.com';

test('the AFK navbar link changes when the mocked URL file changes after five seconds', async () => {
  const link = { href: '' };
  const document = { visibilityState: 'visible', querySelectorAll: selector => selector === '[data-nav="afk"]' ? [link] : [] };
  const responses = [current, next];
  const requests = [];
  let interval;
  const context = {
    document,
    URL,
    AbortSignal,
    Promise,
    fetch: async (path, options) => {
      requests.push({ path, options });
      return { ok: true, json: async () => ({ url: responses.shift() }) };
    },
    setInterval(callback, delay) { interval = { callback, delay }; return 1; },
    clearInterval() {},
    window: {}
  };
  vm.runInNewContext(readFileSync(new URL('../public/afk-link.js', import.meta.url), 'utf8'), context);
  const controller = context.window.HelixAfkLink;
  await controller.ready;
  assert.equal(link.href, current);
  assert.equal(interval.delay, 5000);
  await interval.callback();
  assert.equal(link.href, next);
  assert.equal(requests.length, 2);
  assert.ok(requests.every(request => request.path === '/api/afk/url' && request.options.credentials === 'omit'));
  controller.stop();
});

test('invalid URL-file contents and fetch failures keep the last valid destination', async () => {
  const link = { href: '' };
  const document = { visibilityState: 'visible', querySelectorAll: () => [link] };
  const responses = [current, 'https://attacker.example', null];
  const context = {
    document,
    URL,
    AbortSignal,
    Promise,
    fetch: async () => {
      const value = responses.shift();
      if (value === null) throw Error('offline');
      return { ok: true, json: async () => ({ url: value }) };
    },
    setInterval: () => 1,
    clearInterval() {},
    window: {}
  };
  vm.runInNewContext(readFileSync(new URL('../public/afk-link.js', import.meta.url), 'utf8'), context);
  const controller = context.window.HelixAfkLink;
  await controller.ready;
  await controller.refresh();
  assert.equal(link.href, current);
  await controller.refresh();
  assert.equal(link.href, current);
  controller.stop();
});

test('only a single HTTPS Cloudflare quick-tunnel origin is accepted', () => {
  assert.equal(validateAfkUrl(current + '\n'), current);
  for (const value of ['http://test-afk.trycloudflare.com', 'https://attacker.example', 'https://user@test-afk.trycloudflare.com', 'https://test-afk.trycloudflare.com/path', current + '\n' + next]) {
    assert.equal(validateAfkUrl(value), null);
  }
});

test('the URL endpoint uses a server-side token and a five-second Vercel cache', async () => {
  let outbound;
  const service = createAfkUrlService({ fetcher: async (url, options) => {
    outbound = { url, options };
    return new Response(current + '\n');
  } });
  const response = await service.handle(new Request(origin + '/api/afk/url'), { AFK_GITHUB_TOKEN: 'test-secret-token' });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { url: current });
  assert.equal(outbound.url, 'https://api.github.com/repos/cosmofn/helixafk/contents/url.txt?ref=main');
  assert.equal(outbound.options.headers.Authorization, 'Bearer test-secret-token');
  assert.equal(outbound.options.headers.Accept, 'application/vnd.github.raw');
  assert.equal(response.headers.get('vercel-cdn-cache-control'), 'public, s-maxage=5');
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
});

test('invalid tunnel URLs fail closed and the redirect endpoint does not cache tunnel locations', async () => {
  const service = createAfkUrlService({ fetcher: async () => new Response('https://attacker.example') });
  const invalid = await service.handle(new Request(origin + '/api/afk/url'), {});
  assert.equal(invalid.status, 503);
  assert.equal((await invalid.text()).includes('attacker.example'), false);

  const redirectService = createAfkUrlService({ fetcher: async () => new Response(current) });
  const redirect = await redirectService.handle(new Request(origin + '/api/afk/redirect'), {});
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.get('location'), current);
  assert.equal(redirect.headers.get('cache-control'), 'private, no-store');
});
