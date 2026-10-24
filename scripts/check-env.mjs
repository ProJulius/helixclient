import { validSiteOrigin } from '../lib/security.mjs';

// Run against the deployment's environment. Values never appear in the output.
const checks = {
  SITE_ORIGIN: value => !!validSiteOrigin(value),
  DISCORD_CLIENT_ID: value => /^\d{17,20}$/.test(value || ''),
  DISCORD_CLIENT_SECRET: value => typeof value === 'string' && value.length >= 16,
  SESSION_SECRET: value => typeof value === 'string' && value.length >= 32,
  BLOB_READ_WRITE_TOKEN: value => /^vercel_blob_rw_/.test(value || '')
};
let failed = false;
for (const [name, validate] of Object.entries(checks)) {
  const valid = validate(process.env[name]);
  console.log(name + ': ' + (valid ? 'present; format valid' : 'MISSING OR INVALID'));
  if (!valid) failed = true;
}
if (process.env.ADMIN_DISCORD_ID && !/^\d{17,20}$/.test(process.env.ADMIN_DISCORD_ID)) { console.log('ADMIN_DISCORD_ID: INVALID'); failed = true; }
console.log('This validates formats, not credential authenticity or secret entropy.');
if (failed) process.exitCode = 1;
