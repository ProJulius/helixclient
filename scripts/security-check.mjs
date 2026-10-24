import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkPublicAssets, credentialTypes } from './check-public.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const filenames = git(['ls-files', '--cached', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean);
const localSecrets = [];
for (const name of ['.env', '.env.local']) {
  if (!existsSync(path.join(root, name))) continue;
  const text = readFileSync(path.join(root, name), 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^(?:DISCORD_CLIENT_SECRET|SESSION_SECRET|BLOB_READ_WRITE_TOKEN)\s*=\s*["']?([^"'\s]+)["']?\s*$/);
    if (match?.[1].length >= 16) localSecrets.push(match[1]);
  }
}
let failed = false;
for (const name of filenames) {
  if (!existsSync(path.join(root, name))) continue;
  const text = readFileSync(path.join(root, name), 'utf8');
  const types = credentialTypes(text);
  if (localSecrets.some(secret => text.includes(secret))) types.push('local environment secret');
  if (/^\.env(?:\.|$)/.test(name) && name !== '.env.example') types.push('tracked environment file');
  if (types.length) { console.error(name + ': ' + [...new Set(types)].join(', ')); failed = true; }
}
const history = git(['log', '--all', '-p', '--format=commit %H', '--no-ext-diff']);
const historyTypes = credentialTypes(history);
if (localSecrets.some(secret => history.includes(secret))) historyTypes.push('local environment secret');
if (historyTypes.length) { console.error('Git history contains credential patterns: ' + historyTypes.join(', ')); failed = true; }
console.log('Checked ' + checkPublicAssets(path.join(root, 'public')) + ' public assets and ' + filenames.length + ' source paths, plus reachable textual Git history.');
console.log('Known credential patterns/local secret comparisons: ' + (failed ? 'FAILED; no values printed.' : 'no matches.'));
if (failed) process.exitCode = 1;
