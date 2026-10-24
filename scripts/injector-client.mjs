import { upload } from '@vercel/blob/client';

window.uploadHelixInjector = async (file, version, onProgress) => {
  const pathname = 'injector/releases/' + crypto.randomUUID() + '/' + file.name;
  return upload(pathname, new Blob([file], { type: 'application/octet-stream' }), {
    access: 'private', multipart: true, contentType: 'application/octet-stream',
    handleUploadUrl: '/api/injector/upload', clientPayload: JSON.stringify({ version }),
    onUploadProgress: event => onProgress(event.percentage)
  });
};
