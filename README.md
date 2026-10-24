# Deploy Helix Client on Vercel

This export includes the current pink Helix frontend, EUR 0.15/day pricing, animations, community counts and Discord OAuth. It uses a Vercel Node.js function instead of the Sites Cloudflare Worker. No real credentials are included.

## 1. Import the project

1. Extract `helix-client-vercel.zip`.
2. Upload the extracted contents to a new GitHub repository. `package.json`, `vercel.json`, `api/`, `lib/` and `public/` must be at the repository root.
3. In Vercel, choose Add New -> Project and import that repository.
4. Use Framework Preset **Other**, Node.js **24.x**, Root Directory **the repository root**, Build Command **node scripts/build-vercel.mjs**, Output Directory **public**. The included `vercel.json` sets the build and output options.
5. Deploy once to obtain the stable production domain, for example `helixclient-example.vercel.app`. Use the main production domain rather than a temporary per-deployment preview URL.

## 2. Set production environment variables

Go to Vercel Project Settings -> Environment Variables and add these for **Production**:

| Name | Value |
| --- | --- |
| SITE_ORIGIN | Your exact production origin, e.g. `https://helixclient-example.vercel.app` (no path) |
| DISCORD_CLIENT_ID | `1558942110114119880` |
| DISCORD_CLIENT_SECRET | Your existing OAuth2 Client Secret from the Discord application |
| SESSION_SECRET | A new random signing secret; generate it privately using the command below |
| DISCORD_INVITE_URL | `https://discord.gg/9EmjevPykx` |

Generate SESSION_SECRET on your own computer and paste its output directly into Vercel:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Store the Client Secret and SESSION_SECRET as sensitive values in Vercel. Do not prefix them with PUBLIC or NEXT_PUBLIC. Do not commit `.env.local` or paste secrets into chat. A Discord bot token is not used. Secrets configured on the current ChatGPT Site are not transferred automatically.

Until SITE_ORIGIN and credentials are configured, the frontend works but account access stays unavailable. Production credentials should not be copied to preview deployments.

## 3. Register the new Discord callback

Open the Discord Developer Portal, select application `1558942110114119880`, then OAuth2 -> Redirects. Add:

```text
https://YOUR-VERCEL-DOMAIN/api/discord/callback
```

Replace YOUR-VERCEL-DOMAIN with the hostname in SITE_ORIGIN. Keep the existing `chatgpt.site` callback if you want both sites to work.

Redeploy the Vercel project after saving environment variables, then open `https://YOUR-VERCEL-DOMAIN/#/dashboard` and click Connect Discord. Complete consent, refresh the dashboard and test Sign out.

## Domains and verification

Vercel assigns a `vercel.app` address. A custom domain requires a domain whose DNS you control; the current `helixclient.casper-schotman.chatgpt.site` address belongs to Sites hosting. If you later change the production domain, update SITE_ORIGIN, the Discord callback and redeploy. The build updates social metadata using SITE_ORIGIN.

This copy was tested locally with Node, including the adapter's routing, secure-cookie preservation, callback origin, logout and the existing mocked OAuth security tests. It has not been deployed or authenticated on a real Vercel account. Actual Discord consent must be checked after deployment. License purchases and all payments now take place on https://helix-client.mysellauth.com/. License redemption/validation is not implemented in this website; signing in does not grant a paid entitlement. The injector can be uploaded by the administrator and downloaded by signed-in users once Blob storage is connected.

## Code and checks

- `public/`: existing frontend and local assets.
- `lib/discord-service.mjs`: shared Discord identity and public-count service.
- `api/index.mjs`: one Web Standard Vercel function, configured by the rewrite in vercel.json.
- `scripts/build-vercel.mjs`: adjusts social metadata for the production origin.
- `npm run check` and `npm test`: syntax and security/adapter checks; no dependencies are required.

Official references: [Vercel Node.js functions](https://vercel.com/docs/functions/runtimes/node-js), [build configuration](https://vercel.com/docs/builds/configure-a-build), [environment variables](https://vercel.com/docs/environment-variables).

## Administrator injector uploads

1. In Vercel, create a **private Blob store** and connect it to this project for Production. Configure its `BLOB_READ_WRITE_TOKEN` as a server secret if the store connection does not add it automatically. Redeploy.
2. Sign in through Discord with the existing administrator ID `1425462441495625768`. `ADMIN_DISCORD_ID` can override that allowlist entry. Other accounts cannot upload.
3. Open the Dashboard or Downloads page, choose the injector file and optional version, then select Upload injector. Maximum: 64 MB. The uploader sends large files directly to private Blob storage using a short-lived admin-authorized token.
4. A verified completion callback publishes release metadata. Signed-in users can then download through the authenticated endpoint. File bytes are streamed with attachment headers; they are not executed or stored in Git.

Connect a private store, not a public store. The shared production store is separate from preview environments and from the original Sites R2 bucket. The current injector is replaced only after a successful upload. Blob authentication callbacks must remain accessible to Vercel; deployment protection can block callbacks on preview deployments.

The site uses the supplied HelixLogo.png and the 134-module built-in UI7 registry; see MODULE_CATALOG.md. Reviews link to https://helix-client.mysellauth.com/feedback. No client JAR, source archive, license credentials or injector binary is committed.
