import { lstatSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

// Detect recognizable credentials without printing their values. This complements,
// rather than replaces, provider/GitHub secret scanning.
export function credentialTypes(text) {
  const patterns = {
    'private key': /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[ \t]*(?:\r?\n|\\n)[A-Za-z0-9+/=]{40,}/,
    'GitHub token': /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/,
    'Discord token': /\b[A-Za-z0-9_-]{23,28}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}\b/,
    'Blob token': /\bvercel_blob_rw_[A-Za-z0-9_-]{24,}\b/g,
    'AWS access key': /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/
  };
  return Object.entries(patterns).filter(([name, pattern]) => {
    const matches = [...text.matchAll(new RegExp(pattern.source, 'g'))];
    return matches.some(match => name !== 'Blob token' || !/test-only|teststore/.test(match[0]));
  }).map(([name]) => name);
}

export function checkPublicAssets(directory) {
  const allowed = new Set(['.html', '.js', '.css', '.png', '.svg', '.ttf', '.woff', '.woff2', '.txt', '.ico', '.webp']);
  let count = 0;
  function visit(folder) {
    for (const name of readdirSync(folder)) {
      const filename = path.join(folder, name);
      const info = lstatSync(filename);
      if (info.isSymbolicLink() || name.startsWith('.') || /(?:^|[._-])(?:env|backup|secret|credential)(?:$|[._-])/i.test(name)) throw Error('Unsafe public asset: ' + path.relative(directory, filename));
      if (info.isDirectory()) { visit(filename); continue; }
      if (!info.isFile() || !allowed.has(path.extname(name).toLowerCase())) throw Error('Unsupported public asset: ' + path.relative(directory, filename));
      if (['.html', '.js', '.css', '.svg', '.txt'].includes(path.extname(name).toLowerCase())) {
        const text = readFileSync(filename, 'utf8');
        const found = credentialTypes(text);
        if (found.length) throw Error('Credential pattern in public asset: ' + path.relative(directory, filename) + ' (' + found.join(', ') + ')');
        if (name === 'config.js' && /["']?DEV_SAMPLE_DATA["']?\s*:\s*true/.test(text)) throw Error('Sample data must be disabled for production.');
      }
      count++;
    }
  }
  visit(directory);
  return count;
}
