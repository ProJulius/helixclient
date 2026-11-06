(() => {
  'use strict';

  const fallback = '/api/afk/redirect';
  let currentUrl = null;
  let pending = false;

  function parseUrl(value) {
    if (typeof value !== 'string') return null;
    const lines = value.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length !== 1) return null;
    try {
      const parsed = new URL(lines[0]);
      if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.port || parsed.pathname !== '/' || parsed.search || parsed.hash || !/^[a-z0-9-]+\.trycloudflare\.com$/i.test(parsed.hostname)) return null;
      return parsed.origin;
    } catch { return null; }
  }

  function apply(root = document) {
    for (const link of root.querySelectorAll('[data-nav="afk"]')) link.href = currentUrl || fallback;
  }

  async function refresh() {
    if (pending) return false;
    pending = true;
    try {
      const response = await fetch('/api/afk/url', { credentials: 'omit', signal: AbortSignal.timeout(5000) });
      if (!response.ok) return false;
      const data = await response.json();
      const nextUrl = parseUrl(data?.url);
      if (!nextUrl) return false;
      currentUrl = nextUrl;
      apply();
      return true;
    } catch { return false; }
    finally { pending = false; }
  }

  const initialRefresh = refresh();
  const interval = setInterval(() => {
    if (document.visibilityState !== 'hidden') return refresh();
    return false;
  }, 5000);

  window.HelixAfkLink = {
    apply,
    refresh,
    ready: initialRefresh,
    stop() { clearInterval(interval); }
  };
})();
