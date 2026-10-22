import { readFileSync, writeFileSync } from 'node:fs';

const filename = new URL('../public/index.html', import.meta.url);
let html = readFileSync(filename, 'utf8').replace(/\s*<meta property="og:(?:url|image)"[^>]*>/g, '');
if (process.env.SITE_ORIGIN) {
  const url = new URL(process.env.SITE_ORIGIN);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw Error('SITE_ORIGIN must be your HTTPS production origin, without a path.');
  html = html.replace('<meta property="og:type" content="website">', '<meta property="og:type" content="website">\n  <meta property="og:url" content="' + url.origin + '">\n  <meta property="og:image" content="' + url.origin + '/social.png">');
}
writeFileSync(filename, html);
console.log('Vercel public assets prepared. Discord runs through api/index.mjs.');
