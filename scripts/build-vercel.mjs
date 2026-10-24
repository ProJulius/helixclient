import { readFileSync, writeFileSync } from 'node:fs';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const filename = new URL('../public/index.html', import.meta.url);
let html = readFileSync(filename, 'utf8').replace(/\s*<meta property="og:(?:url|image)"[^>]*>/g, '');
if (process.env.SITE_ORIGIN) {
  const url = new URL(process.env.SITE_ORIGIN);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw Error('SITE_ORIGIN must be your HTTPS production origin, without a path.');
  html = html.replace('<meta property="og:type" content="website">', '<meta property="og:type" content="website">\n  <meta property="og:url" content="' + url.origin + '">\n  <meta property="og:image" content="' + url.origin + '/helix-logo.png">');
}
writeFileSync(filename, html);
await build({ entryPoints: [fileURLToPath(new URL('./injector-client.mjs', import.meta.url))], outfile: fileURLToPath(new URL('../public/injector-upload.js', import.meta.url)), bundle: true, minify: true, platform: 'browser', format: 'iife', target: ['es2022'] });
console.log('Vercel public assets prepared. Discord runs through api/index.mjs.');
