import { exactUploadStream, RequestSizeError } from './security.mjs';

export const INJECTOR_MAX_BYTES = 96 * 1024 * 1024;
export const INJECTOR_ADMIN_ID = '1425462441495625768';
export function injectorAdmin(env, user) {
  const id = env.ADMIN_DISCORD_ID || INJECTOR_ADMIN_ID;
  return /^\d{17,20}$/.test(id) && user?.id === id;
}
export function injectorFilename(value) {
  if (typeof value !== 'string' || value.length > 120 || !/^[A-Za-z0-9][A-Za-z0-9._ ()-]*\.(exe|zip|msi|dmg|appimage|jar|dll)$/i.test(value) || value.includes('..')) return null;
  return value;
}
function injectorJson(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
}
export function r2InjectorStorage(env) {
  const bucket = env.BUCKET;
  if (!bucket) return null;
  const key = 'injector/current';
  const metadata = object => object ? { filename: object.customMetadata?.filename || 'Helix-Injector.exe', version: object.customMetadata?.version || '', uploadedAt: object.customMetadata?.uploadedAt || object.uploaded?.toISOString(), size: object.size } : null;
  return {
    mode: 'server',
    async stat() { return metadata(await bucket.head(key)); },
    async read() { const object = await bucket.get(key); return object ? { body: object.body, release: metadata(object) } : null; },
    async write(body, release) {
      // R2 requires a stream with a runtime-known length. The preceding validation
      // TransformStream loses that metadata; FixedLengthStream restores it in Workers.
      const upload = typeof globalThis.FixedLengthStream === 'function' ? body.pipeThrough(new globalThis.FixedLengthStream(release.size)) : body;
      const object = await bucket.put(key, upload, { httpMetadata: { contentType: 'application/octet-stream' }, customMetadata: { filename: release.filename, version: release.version, uploadedAt: release.uploadedAt } });
      return { ...release, size: object.size };
    }
  };
}
export function createInjectorService({ getAccount, getStorage = r2InjectorStorage }) {
  return {
    async handle(request, env) {
      const url = new URL(request.url);
      if (url.pathname !== '/api/injector' && !url.pathname.startsWith('/api/injector/')) return null;
      const user = await getAccount(request, env);
      if (!user) return injectorJson({ error: 'Sign in with Discord first.' }, 401);
      const canUpload = injectorAdmin(env, user);
      const storage = getStorage(env);
      try {
        if (url.pathname === '/api/injector' && request.method === 'GET') {
          return injectorJson({ configured: !!storage, canUpload, maxBytes: INJECTOR_MAX_BYTES, uploadMode: storage?.mode || null, release: storage ? await storage.stat() : null });
        }
        if (url.pathname === '/api/injector/upload' && request.method === 'PUT') {
          if (!canUpload) return injectorJson({ error: 'Only the Helix administrator can upload an injector.' }, 403);
          if (request.headers.get('origin') !== new URL(env.SITE_ORIGIN || url.origin).origin) return injectorJson({ error: 'Request origin rejected.' }, 403);
          if (!storage || storage.mode !== 'server') return injectorJson({ error: 'Injector storage is not connected.' }, 503);
          const size = Number(request.headers.get('content-length'));
          if (!Number.isSafeInteger(size) || size < 1 || size > INJECTOR_MAX_BYTES) return injectorJson({ error: `Choose a non-empty file up to ${INJECTOR_MAX_BYTES / 1048576} MiB.` }, 413);
          const filename = injectorFilename(request.headers.get('x-injector-filename'));
          const version = request.headers.get('x-injector-version') || '';
          if (!filename || version.length > 60 || /[\x00-\x1f\x7f]/.test(version)) return injectorJson({ error: 'Choose a supported injector file and a short version label.' }, 400);
          if (!request.body) return injectorJson({ error: 'The upload is empty.' }, 400);
          // R2 stores the stream and its metadata as one atomic replacement.
          const release = await storage.write(request.body.pipeThrough(exactUploadStream(size)), { filename, version, size, uploadedAt: new Date().toISOString() });
          return injectorJson({ release });
        }
        if (url.pathname === '/api/injector/download' && request.method === 'GET') {
          if (!storage) return injectorJson({ error: 'Injector storage is not connected.' }, 503);
          const file = await storage.read();
          if (!file) return injectorJson({ error: 'No injector has been uploaded yet.' }, 404);
          const filename = injectorFilename(file.release.filename) || 'Helix-Injector.zip';
          return new Response(file.body, { headers: { 'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment; filename="' + filename + '"', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
        }
        return injectorJson({ error: 'Not found.' }, 404);
      } catch (error) {
        if (error instanceof RequestSizeError) return injectorJson({ error: 'The uploaded file size does not match its declared size.' }, 413);
        return injectorJson({ error: 'The injector could not be saved or loaded. Please try again.' }, 503);
      }
    }
  };
}
