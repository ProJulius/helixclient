(() => {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  let generation = 0;
  async function metadata() {
    const response = await fetch('/api/injector', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw Error('The injector is unavailable. Please refresh and try again.');
    return response.json();
  }
  function render(data) {
    const release = data.release;
    const download = release ? '<div><p class="eyebrow">HELIX INJECTOR</p><h3>' + escape(release.version || 'Latest release') + '</h3><p>' + escape(release.filename) + ' · ' + (release.size / 1048576).toFixed(1) + ' MB</p></div><a class="button primary" href="/api/injector/download">Download injector →</a>' : '<div><p class="eyebrow">HELIX INJECTOR</p><h3>No injector uploaded yet.</h3><p>The download will appear here as soon as it is published.</p></div>';
    const admin = data.canUpload ? '<div class="injector-admin"><p class="eyebrow">ADMINISTRATOR</p><h3>Publish an injector.</h3><p>Choose your release file. Uploading replaces the injector available to signed-in users.</p>' + (data.configured ? '<form id="injector-upload-form"><label>Injector file<input type="file" id="injector-file" accept=".exe,.zip,.msi,.dmg,.appimage,.jar,.dll" required></label><label>Version label (optional)<input type="text" id="injector-version" maxlength="60" placeholder="e.g. 1.0.0"></label><p class="small muted">Maximum file size: 64 MB.</p><button class="button primary" type="submit">Upload injector</button><progress id="injector-progress" max="100" value="0" hidden></progress><p id="injector-upload-status" role="status" aria-live="polite"></p></form>' : '<p class="notice">File storage needs to be connected before you can upload.</p>') + '</div>' : '';
    return '<section class="injector-card"><div class="injector-release">' + download + '</div>' + admin + '</section>';
  }
  function serverUpload(file, version, progress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', '/api/injector/upload');
      xhr.timeout = 180000;
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.setRequestHeader('X-Injector-Filename', file.name);
      xhr.setRequestHeader('X-Injector-Version', version);
      xhr.upload.onprogress = event => { if (event.lengthComputable) progress(event.loaded / event.total * 100); };
      xhr.onload = () => { let data; try { data = JSON.parse(xhr.responseText); } catch {} if (xhr.status >= 200 && xhr.status < 300) resolve(data); else reject(Error(data?.error || 'Upload failed. Please try again.')); };
      xhr.onerror = xhr.ontimeout = () => reject(Error('Upload interrupted. Check your connection and try again.'));
      xhr.send(file);
    });
  }
  async function mount(user) {
    const root = document.querySelector('#injector-panel');
    const current = ++generation;
    if (!root || !user) return;
    try {
      const data = await metadata();
      if (current !== generation || !root.isConnected) return;
      root.innerHTML = render(data);
      root.querySelector('form')?.addEventListener('submit', async event => {
        event.preventDefault();
        const form = event.target;
        const file = form.querySelector('#injector-file').files[0];
        const version = form.querySelector('#injector-version').value.trim();
        const status = form.querySelector('#injector-upload-status');
        const progress = form.querySelector('#injector-progress');
        if (!file || !file.size || file.size > 64 * 1048576 || !/^[A-Za-z0-9][A-Za-z0-9._ ()-]*\.(exe|zip|msi|dmg|appimage|jar|dll)$/i.test(file.name) || file.name.includes('..')) { status.textContent = 'Choose a supported file up to 64 MB, with a simple filename.'; return; }
        if (form.dataset.uploading) return;
        form.dataset.uploading = 'true';
        form.querySelectorAll('input,button').forEach(input => input.disabled = true);
        progress.hidden = false;
        status.textContent = 'Uploading injector…';
        try {
          const update = amount => { progress.value = Math.round(amount); };
          if (data.uploadMode === 'blob') {
            if (!window.uploadHelixInjector) await import('/injector-upload.js');
            await window.uploadHelixInjector(file, version, update);
          } else await serverUpload(file, version, update);
          status.textContent = 'Upload complete. Publishing the download…';
          for (let attempt = 0; attempt < 12; attempt++) {
            const published = await metadata();
            if (published.release && published.release.uploadedAt !== data.release?.uploadedAt) {
              if (root.isConnected && current === generation) {
                await mount(user);
                const notice = document.createElement('p');
                notice.className = 'notice'; notice.setAttribute('role', 'status');
                notice.textContent = 'Injector published. Your new download is ready.';
                document.querySelector('#injector-panel')?.appendChild(notice);
              }
              return;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          status.textContent = 'The file uploaded. Publishing is taking a moment; refresh the dashboard shortly.';
        } catch (error) { status.textContent = error.message || 'Upload failed. Please try again.'; }
        finally { delete form.dataset.uploading; form.querySelectorAll('input,button').forEach(input => input.disabled = false); }
      });
    } catch (error) { if (root.isConnected && current === generation) root.textContent = error.message; }
  }
  window.HelixInjector = { mount };
})();
