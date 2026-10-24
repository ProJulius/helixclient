# Helix website security review

Reviewed 24 October 2026 against the checklist in the supplied video. This records
the controls and verification boundaries; it is not a guarantee that the site is
free of vulnerabilities or an independent penetration test.

## Checklist and evidence

| Video item | Result |
| --- | --- |
| Hide API keys | Discord secrets, the session signing key and Blob read-write token stay in server environment variables. The browser receives only a narrowly scoped upload token after administrator authorization. |
| Proper authentication | Discord authorization-code flow requests only `identify`. HMAC-SHA256 sessions verify signature, purpose, audience and expiry. Secure, HttpOnly, host-only cookies; OAuth state binds the return to the initiating browser. No OAuth access tokens in cookies or local storage. |
| Environment variables | Production API guards require a bare HTTPS `SITE_ORIGIN`. Discord configuration has minimum format/length checks and unavailable states. In the Vercel checkout, `node scripts/check-env.mjs` checks environment formats without printing values. The live Vercel API reports authentication configured and the correct callback origin; the actual secret values have not been inspected. |
| Protect admin routes | Server-side upload authorization compares the signed Discord account ID with `ADMIN_DISCORD_ID` (existing default: `1425462441495625768`). UI visibility and identity headers grant no permission. |
| Check user access | Metadata/downloads require a signed Discord session. Basic is free and needs no license. Premium license redemption/entitlement enforcement is not implemented by this website; purchases go to SellAuth. Do not use this download endpoint as proof of a paid license. |
| Secure API endpoints | Explicit methods, same-origin checks for browser APIs, generic provider failures, private/no-store authenticated responses and signed Blob completion callbacks. |
| Sanitize forms | Server validates filenames/extensions, traversal, version types/lengths/control characters and declared/actual file sizes. Blob token payloads have a 16 KiB streamed limit, including requests without Content-Length. |
| Protect against XSS | Dynamic account, module and release content is escaped or assigned with textContent. Enforced CSP permits local scripts and blocks inline handlers, inline scripts, eval, objects and foreign base URLs. Inline styles remain allowed for the existing theme/animations. Browser injection/CSP tests verify this behavior. |
| Add rate limiting | Bounded counters throttle API routes by platform-provided IP and verified account for downloads/uploads/status. Login: 10/min; callback: 20/min; downloads: 12/min; upload authorization: 12/10 min. Returns 429 with Retry-After. These counters are per running instance, not distributed. Enable the Vercel Firewall rule below for shared edge enforcement. |
| Update dependencies | Package-manager audit found GHSA-mrhx-c7xc-m3w5 in transitive Zod. A pnpm override selects the patched compatible version (>=4.6.6); audit then reported zero known advisories. Recheck periodically; this reflects the advisory database at review time. |
| Remove unused packages | Both direct dependencies are used: `@vercel/blob` for private storage/uploads and `esbuild` for the upload browser bundle. Required transitive/platform packages remain. Sites runtime has no third-party dependencies. |
| Disable debug mode | Production sample-data flag is off and packaging rejects enabling it. Errors sent to clients do not contain provider responses, stack traces or credentials. Development/test scripts are outside the public directory. |
| Exposed files | Public-directory validation rejects hidden files, symlinks, source maps, archives, unsupported file types and recognizable credential patterns. Builds package only public assets plus the Worker/manifest, or Vercel public assets and the configured API function. |
| CORS | Authenticated APIs grant no wildcard allow-origin or cross-origin credential sharing. Browser API requests with foreign Origin/Fetch Metadata are rejected. Public static assets may retain Vercel's allow-origin `*`; this does not expose authenticated APIs. OAuth navigation and SDK-verified Blob callbacks use their own authentication checks. |
| Security headers | CSP, HSTS, nosniff, no-referrer and Permissions-Policy apply to static pages, APIs and errors on both hosting adapters. Only self/ChatGPT framing is allowed to preserve the existing Sites embedding. |
| Hash passwords | Not applicable: the website does not accept or store user passwords; Discord handles login. |
| Secure database access | No SQL database is used. Private Blob access stays server-side; downloads stream as attachments through the authenticated API. Sites uses its server-only bucket binding. Injector files are trusted administrator uploads; they are not executed or malware-scanned by this website. |
| Check Git for secrets | `node scripts/security-check.mjs` scans current source, reachable text history and public assets for recognized token/key formats and any matching locally configured secrets, printing only paths/types. No matches found. Pattern scanning cannot prove absence of all possible secrets. |

## Vercel dashboard action

In your Vercel project's **Firewall**, create and enable a rate-limit rule for
request paths beginning with `/api` (including the underlying `/api` function).
A reasonable starting threshold is **120 requests per 60 seconds per IP**, with
the rate-limit/429 action. The tighter application counters remain in place.
Publish the firewall configuration. This is separate from deploying the code;
no Vercel account access was available to configure or verify this rule here.
Do not add a browser challenge to the Blob callback: it is a signed server request.

Keep `SITE_ORIGIN` on the stable production HTTPS origin and register that same
origin plus `/api/discord/callback` in the Discord application's OAuth2 redirects.
Connect a **private** Blob store with `BLOB_READ_WRITE_TOKEN`, then redeploy after
environment changes. Keep Preview credentials/storage separate if they should not
share production releases. Any token pasted into chat should be rotated at its
provider; the website does not need a Discord bot token.

## Verification and limits

Automated checks cover tampered/expired sessions, OAuth state/issuer/redirects,
spoofed admin headers, regular-user upload denial, cross-origin requests, file
validation and size mismatch, streamed JSON limits, forged callbacks, scoped
administrator upload-token creation, security headers, rate-window reset/account
limits, build file exclusions and browser XSS enforcement. Browser regressions
also cover the existing layout, motion, modules and dashboard states.

Real Discord consent, actual administrator binary uploads/downloads, private-store
configuration, environment values and firewall rules still require verification on
the user's Vercel production deployment. Free access is intentional. Paid license
activation is a separate unfinished feature. Stateless sessions last seven days;
changing SESSION_SECRET invalidates all sessions, with no individual session-revoke
database. Old Vercel release objects are retained in the private store until removed.

Sources: [Vercel security headers](https://vercel.com/docs/cdn-security/security-headers),
[Vercel rate limiting](https://vercel.com/kb/guide/add-rate-limiting-vercel),
[Vercel request headers](https://vercel.com/docs/headers/request-headers),
[Discord OAuth2](https://docs.discord.com/developers/topics/oauth2), and the
installed Blob SDK's authorization/signature checks.
