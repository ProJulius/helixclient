import { get, head, put } from '@vercel/blob';
import { handleUpload } from '@vercel/blob/client';
import { INJECTOR_MAX_BYTES, injectorAdmin, injectorFilename } from './injector-service.mjs';

const pointer = 'injector/latest.json';
export function blobInjectorStorage(env) {
  if (!env.BLOB_READ_WRITE_TOKEN) return null;
  const options = { access: 'private', token: env.BLOB_READ_WRITE_TOKEN, useCache: false };
  return {
    mode: 'blob',
    async stat() {
      const result = await get(pointer, options);
      if (!result || result.statusCode !== 200) return null;
      const value = await new Response(result.stream).json();
      if (!injectorFilename(value.filename) || !/^injector\/releases\/[a-f0-9-]{36}\//.test(value.pathname)) throw Error('Invalid release');
      return value;
    },
    async read() {
      const release = await this.stat();
      if (!release) return null;
      const result = await get(release.pathname, options);
      return result?.statusCode === 200 ? { body: result.stream, release } : null;
    }
  };
}

export async function blobInjectorUpload(request, env, getAccount) {
  const headers = { 'Cache-Control': 'private, no-store' };
  if (!env.BLOB_READ_WRITE_TOKEN) return Response.json({ error: 'Connect a private Vercel Blob store first.' }, { status: 503, headers });
  if (Number(request.headers.get('content-length')) > 16384) return Response.json({ error: 'Upload request is too large.' }, { status: 413, headers });
  try {
    const text = await request.text();
    if (text.length > 16384) throw Error('Too large');
    const body = JSON.parse(text);
    const result = await handleUpload({
      request, body, token: env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const user = await getAccount(request, env);
        if (!injectorAdmin(env, user) || request.headers.get('origin') !== new URL(env.SITE_ORIGIN).origin) throw Error('Not authorized');
        const match = pathname.match(/^injector\/releases\/([a-f0-9-]{36})\/([^/]+)$/);
        const filename = match && injectorFilename(match[2]);
        const { version = '' } = JSON.parse(clientPayload || '{}');
        if (!filename || typeof version !== 'string' || version.length > 60 || /[\x00-\x1f\x7f]/.test(version)) throw Error('Invalid release');
        return {
          addRandomSuffix: false, allowOverwrite: false,
          allowedContentTypes: ['application/octet-stream'], maximumSizeInBytes: INJECTOR_MAX_BYTES,
          validUntil: Date.now() + 10 * 60 * 1000,
          callbackUrl: new URL('/api/injector/upload', env.SITE_ORIGIN).href,
          tokenPayload: JSON.stringify({ adminId: user.id, pathname, filename, version, uploadedAt: new Date().toISOString() })
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // handleUpload verifies Vercel's callback signature before calling this hook.
        const release = JSON.parse(tokenPayload || '{}');
        if (!injectorAdmin(env, { id: release.adminId }) || release.pathname !== blob.pathname || !injectorFilename(release.filename)) throw Error('Invalid release');
        const metadata = await head(blob.pathname, { token: env.BLOB_READ_WRITE_TOKEN });
        if (metadata.size < 1 || metadata.size > INJECTOR_MAX_BYTES) throw Error('Invalid file size');
        const current = await blobInjectorStorage(env).stat();
        if (current && current.uploadedAt > release.uploadedAt) return;
        const published = { pathname: blob.pathname, filename: release.filename, version: release.version, uploadedAt: release.uploadedAt, size: metadata.size };
        await put(pointer, JSON.stringify(published), { access: 'private', token: env.BLOB_READ_WRITE_TOKEN, contentType: 'application/json', allowOverwrite: true, addRandomSuffix: false });
      }
    });
    return Response.json(result, { headers });
  } catch {
    return Response.json({ error: 'Upload authorization failed. Sign in with the administrator Discord account and try again.' }, { status: 403, headers });
  }
}
