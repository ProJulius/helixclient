(() => {
  'use strict';
  const C = window.HELIX_CONFIG;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const euro = n => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(n);
  const safeLink = value => { try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol) ? u.href : null; } catch { return null; } };
  const storage = { read(key, fallback) { try { const v = JSON.parse(localStorage.getItem(`helix-${key}`)); return v ?? fallback; } catch { return fallback; } }, write(key, value) { try { localStorage.setItem(`helix-${key}`, JSON.stringify(value)); } catch { toast(C.copy.notices.storage); } } };
  let language = storage.read('language', 'en');
  if (!C.copy.nav[language]) language = 'en';
  let billing = C.pricing.defaultBilling;
  let days = C.pricing.defaultDays;
  let activeCategory = 'Render';
  let catalogCategory = 'All';
  let catalogQuery = '';
  let showcaseFilter = 'All';
  let showAllReviews = false;
  let currentPage = null;
  let toastTimer;
  let dialogReturnFocus;
  let revealObserver;
  let sectionObserver;
  let quoteTimer;
  let discordSession = { loading: true, configured: false, account: null };
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const motionJobs = new Map();
  function animateContent(element, distance = 7) {
    if (!element) return;
    motionJobs.get(element)?.cancel();
    motionJobs.delete(element);
    if (reducedMotion.matches || typeof element.animate !== 'function') return;
    const animation = element.animate([
      { opacity: 0, transform: `translateY(${distance}px)` },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 230, easing: 'cubic-bezier(.22,.8,.25,1)' });
    motionJobs.set(element, animation);
    animation.finished.then(() => { if (motionJobs.get(element) === animation) motionJobs.delete(element); }, () => {});
  }
  function clearMotion() {
    motionJobs.forEach(animation => animation.cancel());
    motionJobs.clear();
    $$('.click-glow').forEach(el => el.remove());
  }
  function clickFeedback(event) {
    if (reducedMotion.matches) return;
    const control = event.target.closest('.button,.chip,.category-card,.icon-button,.theme-orb,.preview-button,.hamburger');
    if (!control || control.disabled || typeof control.animate !== 'function') return;
    control.classList.add('press-surface');
    $$('.click-glow', control).forEach(el => el.remove());
    const rect = control.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.7;
    const x = event.detail ? event.clientX - rect.left : rect.width / 2;
    const y = event.detail ? event.clientY - rect.top : rect.height / 2;
    const glow = document.createElement('span');
    glow.className = 'click-glow';
    glow.setAttribute('aria-hidden', 'true');
    Object.assign(glow.style, { width: `${size}px`, height: `${size}px`, left: `${x - size / 2}px`, top: `${y - size / 2}px` });
    control.appendChild(glow);
    const animation = glow.animate([{ opacity: .65, transform: 'scale(.2)' }, { opacity: 0, transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.2,.65,.3,1)' });
    animation.finished.then(() => glow.remove(), () => glow.remove());
  }
  reducedMotion.addEventListener('change', event => { if (event.matches) clearMotion(); });
  const toggles = storage.read('toggles', {});
  const modules = C.modules.map(m => ({ ...m, icon: C.categories.find(c => c.id === m.category)?.icon || 'grid' }));
  const categories = C.categories.map(c => ({ ...c, count: modules.filter(m => m.category === c.id).length }));
  const ui = key => C.copy.ui[language][key] ?? C.copy.ui.en[key] ?? key;
  const nav = key => C.copy.nav[language][key] ?? C.copy.nav.en[key] ?? key;
  const iconPaths = {
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>', down: '<path d="m6 9 6 6 6-6"/>', download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    layout: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 9v12"/>',
    zap: '<path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"/>',
    sliders: '<path d="M4 7h7m4 0h5M4 17h3m4 0h9"/><circle cx="13" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4m-2-2h4"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    crosshair: '<circle cx="12" cy="12" r="7"/><path d="M12 2v5m0 10v5M2 12h5m10 0h5"/>',
    keyboard: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h1m4 0h1m4 0h1M6 13h1m4 0h1m4 0h1M7 16h10"/>',
    shield: '<path d="m12 2 8 4v6c0 6-8 10-8 10S4 18 4 12V6l8-4Z"/><path d="m8 12 3 3 5-6"/>',
    check: '<path d="m5 12 4 4L19 6"/>', close: '<path d="m6 6 12 12M6 18 18 6"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z"/>',
    windows: '<path d="m3 5 8-1v7H3V5Zm10-1 8-1v8h-8V4ZM3 13h8v7l-8-1v-6Zm10 0h8v8l-8-1v-7Z"/>',
    cube: '<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 10v10M3 7l9 5 9-5M8 4l9 5"/>',
    discord: '<path d="M8 5 5 4C2 8 1 13 2 17l5 3 1-3m8-12 3-1c3 4 4 9 3 13l-5 3-1-3M7 16c3 2 7 2 10 0M8 5c3-1 5-1 8 0"/><ellipse cx="8.5" cy="11.5" rx="1" ry="1.5"/><ellipse cx="15.5" cy="11.5" rx="1" ry="1.5"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>'
  };
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] || iconPaths.grid}</svg>`;
  const mark = () => '<img class="mark" src="/helix-logo.png" alt="" width="40" height="40" decoding="async">';
  const brand = () => `<a class="brand" href="#home" aria-label="${esc(C.brand.title)} home">${mark()}<span>helix<span>client</span></span></a>`;
  const btn = (label, href, primary = false, glyph = 'arrow', extra = '') => `<a class="button${primary ? ' primary' : ''}" href="${esc(href)}" ${extra}>${esc(label)}${icon(glyph)}</a>`;
  const eyebrow = text => `<p class="eyebrow">${esc(text)}</p>`;
  const heading = (overline, title, accent, lead = '', center = false) => `<div class="section-heading${center ? ' center' : ''}">${eyebrow(overline)}<h2>${esc(title)} <span class="serif accent">${esc(accent)}</span></h2>${lead ? `<p>${esc(lead)}</p>` : ''}</div>`;
  const pageHero = (overline, title, accent, lead) => `<section class="page-hero center container">${eyebrow(overline)}<h1>${esc(title)} <span class="serif accent">${esc(accent)}</span></h1><p class="lead">${esc(lead)}</p></section>`;
  const reviewData = () => C.DEV_SAMPLE_DATA ? C.sampleReviews.map(r => ({ ...r, sample: true })) : C.REVIEWS;

  // Same-origin Discord APIs; unavailable services retain explicit empty states.
  let communitySnapshot = null;
  let communityPending = null;
  async function fetchDiscordStats() {
    if (communitySnapshot?.until > Date.now()) return communitySnapshot.data;
    if (communityPending) return communityPending;
    communityPending = (async () => {
      let data = { available: false };
      const valid = value => value.available && Number.isInteger(value.members) && value.members >= 0 && Number.isInteger(value.online) && value.online >= 0;
      try {
        const response = await fetch(C.discord.apiBase + '/community', { signal: AbortSignal.timeout(5000) });
        if (response.ok) { const result = await response.json(); if (valid(result)) data = result; }
      } catch {}
      // Discord may rate-limit the host's shared IP. The public invite API permits browser requests.
      if (!data.available) {
        try {
          const invite = new URL(C.links.discord);
          const code = invite.protocol === 'https:' && invite.hostname === 'discord.gg' ? invite.pathname.match(/^\/([A-Za-z0-9-]+)\/?$/)?.[1] : null;
          if (code) {
            const response = await fetch('https://discord.com/api/v10/invites/' + encodeURIComponent(code) + '?with_counts=true', { credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(5000) });
            if (response.ok) {
              const result = await response.json();
              const counts = { available: !!result.guild, members: result.approximate_member_count, online: result.approximate_presence_count };
              if (valid(counts)) data = counts;
            }
          }
        } catch {}
      }
      communitySnapshot = { until: Date.now() + (data.available ? 60000 : 15000), data };
      return data;
    })();
    try { return await communityPending; } finally { communityPending = null; }
  }
  async function fetchDiscordSession() {
    try {
      const response = await fetch(C.discord.apiBase + '/session', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw Error('Account unavailable');
      const data = await response.json();
      return { loading: false, configured: data.configured === true, account: data.account || null };
    } catch { return { loading: false, configured: false, account: null, unavailable: true }; }
  }
  async function fetchReviews() { return reviewData(); }
  async function fetchReleases() { return C.releases; }
  async function beginDiscordLogin() { if (discordSession.configured) window.open(C.discord.apiBase + '/login?next=' + (currentPage === 'downloads' ? 'downloads' : 'dashboard'), '_top'); else toast(C.copy.notices.oauth); }
  async function beginCheckout() { const url = safeLink(C.links.checkout); if (url) window.location.assign(url); else toast(C.copy.notices.checkout); }
  window.HelixAPI = { fetchDiscordStats, fetchReviews, fetchReleases, fetchDiscordSession, beginDiscordLogin, beginCheckout };

  function toast(message) { clearTimeout(toastTimer); const el = $('#toast'); el.textContent = message; el.classList.add('visible'); toastTimer = setTimeout(() => el.classList.remove('visible'), 6500); }
  function openDialog(title, body, className = '') {
    const dialog = $('#overlay');
    if (!dialog.open) dialogReturnFocus = document.activeElement;
    dialog.className = className;
    dialog.innerHTML = `<div class="dialog-header"><h2 id="dialog-title">${esc(title)}</h2><button class="icon-button" data-action="close-dialog" aria-label="${esc(ui('close'))}">${icon('close')}</button></div><div class="dialog-content">${body}</div>`;
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open');
  }
  function closeDialog() { $('#overlay').close(); }

  function renderHeader() {
    const p = C.copy.referenceLayout;
    const items = [{ id: 'features', label: language === 'de' ? 'Funktionen' : 'Features', href: '#features' }, { id: 'showcases', label: 'Showcases', href: '#/showcases' }, { id: 'reviews', label: language === 'de' ? 'Bewertungen' : 'Reviews', href: C.links.reviews }, { id: 'pricing', label: nav('pricing'), href: '#pricing' }, { id: 'discord', label: 'Discord', href: '#community', action: 'join-discord' }];
    $('#header').innerHTML = '<div class="navbar reference-navbar"><div class="nav-brand">' + brand() + '<div class="language theme-picker"><button class="theme-orb language-toggle" data-action="language-menu" aria-label="Site colour and language" aria-controls="language-menu" aria-expanded="false"></button><div class="language-menu theme-menu" id="language-menu" hidden><span class="eyebrow">' + esc(p.themeLabel) + '</span><div class="theme-swatches"><button data-theme="#f4add4" style="--swatch:#f4add4" aria-label="Pink"></button><button data-theme="#c4aafa" style="--swatch:#c4aafa" aria-label="Lavender"></button><button data-theme="#a9d9fc" style="--swatch:#a9d9fc" aria-label="Ice blue"></button><label class="custom-color">Custom<input id="custom-theme" type="color" value="' + esc(C.brand.colors.accent) + '" aria-label="Custom accent colour"></label></div><button data-theme="reset">' + esc(p.themeReset) + '</button><div class="locale-options"><button data-language="en">EN · English</button><button data-language="de">DE · Deutsch</button></div><button class="theme-mobile-navigation" data-action="mobile-menu">Explore Helix →</button></div></div></div><nav class="navlinks" aria-label="Main navigation">' + items.map(i => '<a href="' + i.href + '" data-nav="' + i.id + '"' + (i.action ? ' data-action="' + i.action + '"' : '') + '>' + esc(i.label) + '</a>').join('') + '</nav><div class="nav-actions"><a class="button ghost small-btn" href="#/dashboard">' + icon('grid') + esc(nav('dashboard')) + '</a><a class="button primary small-btn" href="#pricing">' + esc(nav('get')) + icon('arrow') + '</a><button class="hamburger" data-action="mobile-menu" aria-label="Open navigation" aria-haspopup="dialog">' + icon('menu') + '</button></div></div>';
    $('.navbar').lang = language;
  }
  function renderFooter() {
    $('#footer').innerHTML = '<div class="reference-footer"><div class="footer-identity">' + brand() + '<span>© ' + C.brand.year + ' ' + esc(C.brand.title) + '</span></div><nav class="footer-nav" aria-label="Footer navigation"><a href="#community" data-action="join-discord">Discord</a><a href="#/showcases">Showcases</a><a href="#/pricing">' + esc(nav('pricing')) + '</a></nav><div class="footer-detail"><span>' + esc(C.copy.disclaimer) + '</span><div><a href="#/modules">' + esc(nav('modules')) + '</a><a href="#/downloads">' + esc(nav('downloads')) + '</a><a href="#/faq">FAQ</a><a href="#/terms">Terms</a><a href="#/privacy">Privacy</a><a href="#/cancellation">Cancellation & withdrawal</a></div></div></div>';
  }
  function landscape() {
    // Original voxel landscape constructed as SVG; no remote textures or screenshots.
    return `<div class="landscape" aria-hidden="true"><svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#8ca497"/><stop offset="1" stop-color="#c0c5a1"/></linearGradient><pattern id="grass" width="36" height="22" patternUnits="userSpaceOnUse"><rect width="36" height="22" fill="#667d42"/><rect width="17" height="9" fill="#789351"/><rect x="20" y="12" width="16" height="7" fill="#59713b"/></pattern><pattern id="stone" width="40" height="28" patternUnits="userSpaceOnUse"><rect width="40" height="28" fill="#73786a"/><path d="M0 12h40M22 0v12M10 12v16" stroke="#535f4c" stroke-width="3"/></pattern><pattern id="leaf" width="22" height="18" patternUnits="userSpaceOnUse"><rect width="22" height="18" fill="#3e653b"/><rect width="10" height="9" fill="#4b7740"/><rect x="13" y="11" width="8" height="7" fill="#315832"/></pattern></defs><rect width="600" height="400" fill="url(#sky)"/><path fill="#d2d5b7" opacity=".55" d="M30 55h110v14H30zm170-17h170v10H200zm210 44h150v12H410z"/><path fill="#74866a" d="M0 180v-33h42v-25h50V97h53v22h37v-30h44v42h55v-18h39v24h46v-29h53v23h41v-13h50v21h50v-19h40v110Z"/><path fill="#536c48" d="M0 220v-53h50v19h45v-36h46v-22h46v34h42v-14h40v44h47v-26h37v-21h58v32h38v-24h51v32h48v-11h52v66Z"/><path fill="url(#grass)" d="M0 209h90v-20h80v13h65v-15h80v30h89v-23h82v15h114v191H0Z"/><path fill="#3b653d" d="M0 254h115v-18h80v20h93v-14h113v-10h119v14h80v154H0Z"/><path fill="#788c57" d="m310 223 100 35 85 27-55 25-120-40-89-10Z"/><path fill="#abb58c" d="m319 224 90 30-32 12-89-27Z"/><path fill="url(#stone)" d="M345 215v-49h57v22h45v-31h62v31h43v34h48v132l-100-18-79-64-76-19Z"/><path fill="#8b9877" d="m345 166 47-16h57l-47 16Zm102-9 45-14h62l-45 14Zm62 31 34-11h43l-34 11Z"/><path fill="#889668" d="M0 304h50v-22h72v23h53v29h95v66H0Z"/><path fill="#476738" d="M0 320h50v-20h72v23h53v29h95v48H0Z"/><path fill="#83795a" d="M166 195h17v82h-17Z"/><path fill="url(#leaf)" d="M121 145h43v-30h50v29h35v54h-35v19h-67v-25h-26Z"/><path fill="#759050" d="M121 145h43l16-11h50l-16 10h35l-22-13h-47v-29l-16 13v30Z"/><path fill="#68734d" d="M44 189h12v69H44Z"/><path fill="url(#leaf)" d="M13 151h29v-26h35v29h22v37H69v15H35v-17H13Z"/><g fill="#a8af65"><rect x="95" y="271" width="4" height="16"/><rect x="89" y="268" width="4" height="12"/><rect x="237" y="306" width="4" height="18"/><rect x="231" y="310" width="4" height="13"/><rect x="280" y="287" width="4" height="14"/></g><g fill="#bac8a7" opacity=".3"><rect x="372" y="188" width="13" height="8"/><rect x="462" y="207" width="10" height="9"/><rect x="526" y="237" width="16" height="8"/></g></svg></div>`;
  }
  function scene() { return `<div class="concept-scene">${landscape()}<span class="scene-label">helix <span style="opacity:.5">/</span> your world</span><div class="scene-hud" data-hud><span>144 FPS</span><span>28 MS</span></div><span class="scene-crosshair" aria-hidden="true">+</span><span class="scene-coordinates">X: 128 &nbsp; Y: 72 &nbsp; Z: -346</span><div class="scene-keycaps" data-keys aria-hidden="true"><span class="pressed">W</span><span>A</span><span>S</span><span>D</span></div><span class="scene-status"><span class="dot"></span> Make yourself at home.</span></div>`; }
  function concept() {
    return `<div class="concept-caption"><span>${esc(C.copy.conceptEyebrow)}</span><span>${esc(C.copy.conceptLabel)} ↗</span></div><div class="concept-window"><div class="window-bar"><span class="window-dots"><i></i><i></i><i></i></span><span class="window-brand">${mark()} helix interface</span><span>${esc(C.product.minecraft)}</span></div><div class="concept-body"><div class="concept-panel">${eyebrow(C.copy.conceptOverline)}<h3>${esc(C.copy.conceptTitle)}</h3><p>${esc(C.copy.conceptSubtitle)}</p><label class="search-box">${icon('search')}<input id="concept-search" type="search" placeholder="${esc(ui('search'))}" aria-label="Filter interface concept modules"><span class="keycap" aria-hidden="true">⌘ K</span></label><div id="concept-modules">${conceptRows()}</div></div>${scene()}</div></div>`;
  }
  function conceptRows(query = '') {
    const icons = ['layout', 'search', 'keyboard', 'sparkles'];
    const filtered = modules.slice(0, 4).filter(m => m.name.toLowerCase().includes(query.toLowerCase()));
    return filtered.length ? filtered.map(m => `<button class="module-row" role="switch" aria-checked="${toggles[m.id] !== false}" data-toggle="${m.id}"><span class="module-icon">${icon(icons[modules.indexOf(m)])}</span><span><strong>${esc(m.name)}</strong><small>${esc(m.description.replace(/\.$/, ''))}</small></span><span class="switch" aria-hidden="true"></span></button>`).join('') : '<p class="small muted" style="padding:20px 0">No matching modules.</p>';
  }
  function menuModules() {
    return modules.filter(m => m.category === activeCategory).slice(0, 6).map(m => `<button class="menu-module" data-detail="${m.id}" aria-label="Explore ${esc(m.name)}">${icon(m.icon)}<span class="mini-dot" aria-hidden="true"></span><strong>${esc(m.name)}</strong><small>${esc(m.description)}</small></button>`).join('');
  }
  function menuShowcase() {
    const p = C.copy.referenceLayout;
    return '<div class="menu-window reference-menu"><div class="module-board" aria-label="Helix module menu concept"><div class="board-columns">' + categories.map(c => '<div class="board-column" data-board-category="' + c.id + '"><div class="board-column-title">' + icon(c.icon) + '<span>' + esc(c.id.toUpperCase()) + '</span><span class="board-collapse">−</span></div>' + modules.filter(m => m.category === c.id).map(m => '<button class="board-module" role="switch" aria-checked="' + (toggles[m.id] !== false) + '" data-toggle="' + m.id + '"><span>' + esc(m.name.toUpperCase()) + '</span><span class="board-switch" aria-hidden="true"></span></button>').join('') + '</div>').join('') + '</div><span class="board-watermark">HELIX CLIENT</span><span class="board-caption">INTERFACE CONCEPT</span><button class="board-search icon-button" data-action="global-search" aria-label="Search modules">' + icon('search') + '</button></div></div><div class="reference-categories" role="group" aria-label="Preview categories">' + categories.map(c => '<button class="category-card" data-category="' + c.id + '" aria-pressed="false">' + icon(c.icon) + '<span>' + esc(c.id) + '</span></button>').join('') + '<a class="category-card" href="#/modules">' + icon('grid') + '<span>All ' + C.product.moduleCount + C.product.moduleSuffix + ' modules</span></a></div><div class="reference-special"><span>' + esc(p.specialLabel) + '</span>' + p.special.map(s => '<span>' + esc(s) + '</span>').join('<span aria-hidden="true">/</span>') + '</div>';
  }
  function chooseCategory(id) {
    if (!categories.some(c => c.id === id)) return;
    activeCategory = id;
    $$('[data-category]').forEach(el => { const active = el.dataset.category === id; el.classList.toggle('active', active); el.setAttribute('aria-pressed', String(active)); });
    $$('[data-board-category]').forEach(el => { el.classList.toggle('board-selected', el.dataset.boardCategory === id); el.classList.toggle('board-muted', el.dataset.boardCategory !== id); });
  }
  function reviewSection() {
    const reviews = reviewData();
    if (!reviews.length) return `<div class="review-empty">${icon('star')}<h3>${esc(C.copy.reviewEmpty)}</h3><p>${esc(C.copy.reviewEmptyText)}</p>${btn(ui('review'), C.links.reviews, false, 'arrow')}</div>`;
    const average = reviews.reduce((a, r) => a + Math.max(1, Math.min(5, Number(r.rating) || 1)), 0) / reviews.length;
    return `<div class="rating-summary center"><strong>${average.toFixed(1)}</strong><span class="stars" aria-label="${average.toFixed(1)} out of 5 stars">★★★★★</span><p class="small">from ${reviews.length} ${C.DEV_SAMPLE_DATA ? 'sample ' : ''}reviews</p></div><div class="review-grid">${reviews.slice(0, showAllReviews ? reviews.length : 3).map(r => `<article class="review-card"><div class="review-author">${mark()}<div><strong>${r.sample ? 'SAMPLE · ' : ''}${esc(r.name)}</strong><small>${esc(r.date)}</small></div></div><span class="stars" aria-label="${Math.max(1, Math.min(5, Number(r.rating) || 1))} out of 5 stars">${'★'.repeat(Math.max(1, Math.min(5, Number(r.rating) || 1)))}</span><p>${esc(r.text)}</p></article>`).join('')}</div><div class="actions" style="margin-top:25px">${reviews.length > 3 ? `<button class="button" data-action="all-reviews">${showAllReviews ? 'Show fewer' : `Show all ${reviews.length}`}</button>` : ''}${btn(ui('review'), C.links.reviews)}</div>`;
  }
  function plans() {
    const p = C.copy, r = p.referenceLayout;
    const featureList = features => '<ul class="plan-features">' + features.map(f => '<li>' + icon('check') + esc(f) + '</li>').join('') + '</ul>';
    const shopButton = extra => '<a class="button full ' + extra + '" href="' + esc(C.links.checkout) + '" target="_top">' + esc(p.premium.cta) + '</a>';
    return '<div class="plans reference-plans"><article class="plan"><p class="plan-name">' + esc(r.basicName) + '</p><div class="plan-price license-ready">Ready.</div><p class="plan-subtitle">Your license. Your next session.</p>' + featureList(p.basic.features) + '<a class="button full" href="#/dashboard">' + esc(p.basic.cta) + '</a></article><article class="plan monthly-plan"><p class="plan-name">' + esc(r.monthlyName) + '</p><div class="plan-price">' + euro(C.pricing.dailyCents * C.pricing.daysInMonth / 100) + '</div><p class="plan-subtitle">' + C.pricing.daysInMonth + ' days access · ' + euro(C.pricing.dailyCents / 100) + ' per day</p>' + customDays() + featureList([...p.premium.features, p.premium.monthlyFeature]) + '<p class="lifetime-nudge">Choose your license in our store.</p>' + shopButton('') + '</article><article class="plan featured"><span class="plan-tag">Best value</span><p class="plan-name">' + esc(r.lifetimeName) + '</p><div class="plan-price">' + euro(C.pricing.lifetimeEUR) + '</div><p class="plan-subtitle">One purchase. Lifetime Premium access.</p>' + featureList([...p.premium.features, p.premium.lifetimeFeature]) + shopButton('premium-checkout') + '</article></div><div class="how-buy reference-buy">' + eyebrow('HOW TO BUY') + '<div class="buy-step-grid">' + r.buy.map((s, i) => '<div><span>' + (i + 1) + '</span>' + esc(s) + '</div>').join('') + '</div><p>' + esc(r.buyNote) + '</p><p class="legal-note">Purchases and payments are handled on SellAuth. <a href="#/dashboard">Open your dashboard</a>.</p></div>';
  }
  function customDays() {
    return '<div class="custom-days"><label for="custom-days">Choose custom amount</label><div class="stepper"><input id="custom-days" type="number" min="' + C.pricing.minimumDays + '" max="' + C.pricing.maximumDays + '" step="' + C.pricing.dayStep + '" value="' + days + '" aria-label="Number of Premium days"><span>days</span><span class="custom-equals">=</span><strong id="days-total" aria-live="polite"></strong></div><input class="days-range" id="custom-days-range" type="range" min="' + C.pricing.minimumDays + '" max="' + C.pricing.maximumDays + '" step="' + C.pricing.dayStep + '" value="' + days + '" aria-label="Choose Premium days" aria-describedby="days-unit"><p class="custom-per-day" id="days-unit"></p></div>';
  }
  function updateDays() {
    const perDay = C.pricing.dailyCents / 100;
    if ($('#custom-days')) $('#custom-days').value = days;
    if ($('#days-total')) $('#days-total').textContent = euro(days * C.pricing.dailyCents / 100);
    if ($('#days-unit')) $('#days-unit').textContent = euro(perDay) + ' per day';
    const slider = $('#custom-days-range');
    if (slider) {
      slider.value = days;
      slider.style.setProperty('--range-progress', `${100 * (days - C.pricing.minimumDays) / (C.pricing.maximumDays - C.pricing.minimumDays)}%`);
      slider.setAttribute('aria-valuetext', `${days} days, ${euro(days * C.pricing.dailyCents / 100)}`);
    }
  }
  function homePage() {
    const p = C.copy, r = p.referenceLayout;
    const icons = ['layout','search','keyboard','grid','eye','layout','zap','sliders','sparkles','cube','check','discord'];
    const marquee = r.marquee.map((s,i) => '<span>' + icon(icons[i]) + esc(s) + '</span>').join('');
    return '<section class="hero reference-hero center" id="home"><h1>' + esc(r.heroBefore) + ' <em class="accent">' + esc(r.heroEmphasis) + '</em><br>' + esc(r.heroAfter) + '</h1><p class="hero-lead">' + esc(r.lead) + '</p><div class="actions">' + btn(r.heroButton, '#pricing', false, 'download') + '<button class="button" data-action="join-discord">' + icon('discord') + esc(r.secondaryButton) + '</button></div><div class="meta-row"><span class="pill">' + icon('cube') + 'Minecraft ' + esc(C.product.minecraft) + '</span><span class="pill" title="Compatibility awaiting release verification">' + icon('windows') + esc(C.product.operatingSystems.join(' / ')) + '</span><a class="pill" href="#community" data-action="join-discord">' + '<span class="dot"></span><span data-discord-chip>Discord community</span></a><a class="pill" href="#/modules">' + icon('grid') + '<span data-count="' + C.product.moduleCount + '">' + C.product.moduleCount + '</span>' + C.product.moduleSuffix + ' modules</a></div><div id="hero-rating"></div></section><div class="marquee reference-marquee" aria-label="' + esc(r.marquee.join('. ')) + '"><div class="marquee-track" aria-hidden="true">' + Array.from({length:4},()=>'<div class="marquee-group">' + marquee + '</div>').join('') + '</div></div><section class="section features reference-section" id="features"><span id="modules" class="anchor-alias"></span><div class="container reveal">' + heading('FEATURES', r.featureTitle, r.featureEmphasis, r.featureLead, true) + menuShowcase() + '</div></section><section class="section reference-section" id="reviews"><div class="container reveal">' + heading('REVIEWS', p.reviewTitle, p.reviewAccent, '', true) + '<div id="review-content">' + reviewSection() + '</div></div></section><section class="section reference-section pricing-section" id="pricing"><div class="container reveal">' + heading('PRICING', p.pricingTitle, p.pricingAccent, r.pricingLead, true) + '<div id="plans">' + plans() + '</div></div></section><span id="community" class="anchor-alias"></span>';
  }
  function catalogCards() {
    const results = modules.filter(m => (catalogCategory === 'All' || m.category === catalogCategory) && `${m.name} ${m.description} ${m.category}`.toLowerCase().includes(catalogQuery.toLowerCase()));
    return results.length ? results.map(m => `<button class="catalog-module" data-detail="${m.id}">${icon(m.icon)}<span class="badge">${esc(m.category.toUpperCase())}</span><h3>${esc(m.name)}</h3><p>${esc(m.description)}</p></button>`).join('') : '<div class="no-results"><h3>No modules found.</h3><p class="small" style="margin-top:12px">Try a different search or category.</p></div>';
  }
  function modulesPage() {
    const p = C.copy;
    return `${pageHero(p.catalogEyebrow, p.catalogTitle, p.catalogAccent, p.catalogLead)}<section class="page-content container"><p class="notice">${esc(p.catalogNotice)}</p><div class="catalog-toolbar"><div class="chips" role="group" aria-label="Filter module category">${['All', ...categories.map(c => c.id)].map(c => `<button class="chip ${c === catalogCategory ? 'active' : ''}" data-filter="${c}" aria-pressed="${c === catalogCategory}">${esc(c === 'All' ? ui('all') : c)}</button>`).join('')}</div><label class="search-box">${icon('search')}<input type="search" id="catalog-search" value="${esc(catalogQuery)}" placeholder="${esc(ui('search'))}" aria-label="Search the module catalog"><span class="keycap" aria-hidden="true">⌘ K</span></label></div><div class="module-grid" id="catalog-grid">${catalogCards()}</div><p class="results-meta" id="results-meta" aria-live="polite"></p></section>`;
  }
  function updateCatalog() {
    $('#catalog-grid').innerHTML = catalogCards();
    const count = $$('.catalog-module').length;
    $('#results-meta').textContent = `${count} module${count === 1 ? '' : 's'}${catalogQuery ? ` matching “${catalogQuery}”` : ''}`;
    $$('[data-filter]').forEach(b => { const selected = b.dataset.filter === catalogCategory; b.classList.toggle('active', selected); b.setAttribute('aria-pressed', selected); });
  }
  function faqItems(items = C.faq) { return `<div class="faq-list">${items.map(([q, a]) => `<details class="faq-item"><summary>${esc(q)}${icon('plus')}</summary><p>${esc(a)}</p></details>`).join('')}</div>`; }
  function pricingPage() {
    const p = C.copy;
    return pageHero(p.pricingEyebrow, p.pricingTitle, p.pricingAccent, p.pricingLead) + '<section class="page-content container"><div id="plans">' + plans() + '</div><div class="pricing-faq">' + heading(p.faqEyebrow, 'A license.', 'A little clarity.', '', true) + faqItems([C.faq[1], C.faq[4], C.faq[5]]) + '</div></section>';
  }
  function accountPage(downloads = false) {
    const p = C.copy;
    const hero = downloads ? pageHero('READY WHEN YOU ARE', p.downloadsTitle, p.downloadsAccent, p.downloadsLead) : pageHero('YOUR HELIX, CONNECTED', p.dashboardTitle, p.dashboardAccent, p.dashboardLead);
    return `${hero}<section class="page-content container"><div id="account-content" aria-live="polite">${accountPanel(downloads)}</div></section>`;
  }
  function accountPanel(downloads = false) {
    if (discordSession.loading) return `<div class="account-panel center" aria-busy="true"><span class="account-loading" aria-hidden="true"></span><h2>A moment for your account.</h2><p>Checking your Discord connection.</p></div>`;
    if (discordSession.unavailable) return `<div class="account-panel center">${icon('discord')}<h2>We could not reach your account.</h2><p>Please try again in a moment.</p><button class="button" data-action="refresh-account">Try again ${icon('arrow')}</button></div>`;
    const user = discordSession.account;
    if (!user) {
      const reason = new URLSearchParams(location.hash.split('?')[1] || '').get('auth');
      const messages = { expired: 'Your sign-in attempt expired. Please connect again.', cancelled: 'Discord sign-in was cancelled. You can try again whenever you are ready.', failed: 'Discord could not complete sign-in. Please try again.', setup: 'Discord sign-in is being set up. Join the community in the meantime.' };
      const notice = messages[reason];
      const next = downloads ? 'downloads' : 'dashboard';
      return `<div class="account-panel center">${icon('discord')}<h2>Everything starts with Discord.</h2><p>Connect your account to access your Helix dashboard. We only ask for your basic Discord profile.</p>${notice ? `<p class="notice">${esc(notice)}</p>` : ''}${discordSession.configured ? `<div class="actions"><a class="button primary" href="${C.discord.apiBase}/login?next=${next}" target="_top">${icon('discord')} Connect Discord ${icon('arrow')}</a></div>` : `<p class="notice">Discord sign-in will be available soon. Your community is already connected.</p><button class="button primary" data-action="join-discord">${icon('discord')} Join the community ${icon('arrow')}</button>`}</div>`;
    }
    return '<div class="account-panel"><div class="account-identity">' + mark() + '<div>' + eyebrow('CONNECTED WITH DISCORD') + '<h2>' + esc(user.displayName || user.username) + '</h2><p class="account-name">@' + esc(user.username) + '</p></div><button class="button" data-action="logout">Sign out</button></div><div class="account-stats"><div class="account-stat"><small>Discord ID</small><strong class="discord-id">' + esc(user.id) + '</strong></div><div class="account-stat"><small>Connection</small><strong>Verified</strong></div><div class="account-stat"><small>Licenses</small><a href="' + esc(C.links.checkout) + '" target="_top">Get a license on SellAuth →</a></div></div><div id="injector-panel"><p role="status">Checking injector availability…</p></div><h3 style="margin-top:30px">From license to in-game.</h3><ol class="install-steps">' + C.copy.downloadSteps.map(step => '<li>' + esc(step) + '</li>').join('') + '</ol></div>';
  }

  function releaseList() {
    if (!C.releases.length) return '<div class="release-info"><div><h3>No release published yet.</h3><p>Verified files and a changelog will appear here when a release is available.</p></div><button class="button small-btn" disabled>Download unavailable</button></div>';
    return C.releases.map(r => `<article class="release-info"><div><h3>${esc(r.version)}</h3><p>Minecraft ${esc(r.minecraft)} · ${esc(r.date)}</p><details><summary class="small">Changelog</summary><p>${esc(r.changelog)}</p></details></div><button class="button small-btn" disabled>Sign-in required</button></article>`).join('');
  }
  function showcasesPage() {
    const p = C.copy, r = p.referenceLayout;
    return pageHero('SHOWCASES', r.showcaseTitle, r.showcaseAccent, r.showcaseLead) + '<section class="page-content container reference-showcases"><p class="showcase-disclosure">' + esc(p.showcaseNotice) + '</p><div class="chips" role="group" aria-label="Filter setup concepts">' + ['All', ...new Set(C.showcases.map(s=>s.type))].map(t=>'<button class="chip ' + (showcaseFilter===t?'active':'') + '" data-showcase-filter="' + t + '" aria-pressed="' + (showcaseFilter===t) + '">' + esc(t==='All'?'All setups':t) + '</button>').join('') + '</div><div class="showcase-grid reference-showcase-story" id="showcase-grid">' + showcaseCards() + '</div><div class="showcase-cta"><p>' + esc(r.showcaseEnd) + '</p><button class="button" data-action="submit-setup">Submit your setup' + icon('arrow') + '</button></div></section>';
  }
  function showcaseCards() {
    return C.showcases.filter(s => showcaseFilter === 'All' || s.type === showcaseFilter).map((s,i)=>'<article class="showcase-story-item story-' + i + '"><h2>' + esc(s.name.split(' ').slice(0,-1).join(' ')) + ' <em class="accent">' + esc(s.name.split(' ').slice(-1)[0]) + '</em></h2><button class="showcase-card ' + esc(s.theme) + '" data-showcase="' + esc(s.id) + '" aria-label="View ' + esc(s.name) + ' setup concept"><div class="showcase-scene">' + scene() + '<span class="showcase-expand">' + icon('plus') + '</span></div><div class="showcase-text"><small>' + esc(s.type.toUpperCase()) + ' · DESIGN CONCEPT</small><p>' + esc(s.description) + '</p></div></button></article>').join('');
  }
  function legalPage(key) { const p = C.legal[key]; return `${pageHero('THE DETAILS', p.title, '', 'Draft information for review before public sales.')}<section class="page-content container legal-page"><p class="notice warning">${esc(C.legal.warning)}</p>${p.sections.map(([title, content]) => `<article class="legal-section"><h2>${esc(title)}</h2><p>${esc(content)}</p></article>`).join('')}${key === 'privacy' ? '<button class="button" data-action="reset-preferences">Reset local preferences</button>' : ''}</section>`; }
  function detail(id) {
    const m = modules.find(x => x.id === id); if (!m) return;
    openDialog(m.name, icon(m.icon) + '<div class="dialog-tags"><span class="badge">' + esc(m.category.toUpperCase()) + '</span></div><p>' + esc(m.description) + '</p><div class="detail-info"><div><span>Category</span><span>' + esc(m.category) + '</span></div></div>' + btn('Open dashboard', '#/dashboard', true), 'drawer');
  }
  function searchPalette() {
    openDialog('Find your next module.', `<label class="search-box">${icon('search')}<input id="global-search" type="search" placeholder="${esc(ui('search'))}" aria-label="Global module search" autocomplete="off"><span class="keycap">ESC</span></label><div class="search-results" id="global-results" aria-live="polite"></div><p class="small muted" style="margin:15px 0 0">Use Tab to explore results. Enter to open a module.</p>`);
    updateGlobalSearch(''); $('#global-search').focus();
  }
  function updateGlobalSearch(query) {
    const results = modules.filter(m => `${m.name} ${m.category} ${m.description}`.toLowerCase().includes(query.toLowerCase()));
    $('#global-results').innerHTML = results.length ? results.slice(0, 12).map(m => `<button class="search-result" data-detail="${m.id}"><span><strong>${esc(m.name)}</strong><small>${esc(m.category)} · ${esc(m.description)}</small></span>${icon('arrow')}</button>`).join('') : '<p class="small" style="padding:20px 0">No modules found. Try another search.</p>';
  }
  function lightbox(id) {
    const s = C.showcases.find(x => x.id === id); if (!s) return;
    openDialog(s.name, `<div class="showcase-scene">${scene()}</div><p style="margin:20px 0">${esc(s.description)}</p><div class="dialog-tags">${s.modules.map(m => `<span class="badge">${esc(m)}</span>`).join('')}</div><p class="notice">Original design concept · This is an illustrative setup, not a player submission.</p>`, 'lightbox');
  }
  function getPage() {
    const hash = location.hash;
    if (!hash.startsWith('#/')) return 'home';
    return hash.slice(2).split('?')[0] || 'home';
  }
  function render(force = false) {
    const page = getPage();
    if (currentPage === page && !force) { scrollToHash(); return; }
    const changingPage = currentPage !== null;
    clearMotion();
    if ($('#overlay').open) closeDialog();
    clearInterval(quoteTimer);
    currentPage = page;
    const p = C.copy;
    const routes = { home: homePage, modules: modulesPage, pricing: pricingPage, downloads: () => accountPage(true), dashboard: () => accountPage(false), faq: () => `${pageHero(p.faqEyebrow, p.faqTitle, p.faqAccent, p.faqLead)}<section class="page-content container">${faqItems()}</section>`, showcases: showcasesPage, terms: () => legalPage('terms'), privacy: () => legalPage('privacy'), cancellation: () => legalPage('cancellation') };
    $('#main').innerHTML = routes[page] ? routes[page]() : `${pageHero('A DIFFERENT PATH', 'Page not found.', '', 'Let’s get you back to your game.')}<div class="center page-content">${btn('Back to home', '#home', true)}</div>`;
    document.title = page === 'home' ? `${C.brand.title} — ${C.brand.tagline}` : `${page.charAt(0).toUpperCase() + page.slice(1)} — ${C.brand.title}`;
    renderHeader(); renderFooter(); updateDays(); syncScene();
    if (page === 'modules') updateCatalog();
    window.scrollTo({ top: 0, behavior: 'instant' });
    $('#main').focus({ preventScroll: true });
    setupObservers(); hydrateData();
    if (changingPage) animateContent($('#main'), 9);
    requestAnimationFrame(scrollToHash);
  }
  function scrollToHash() {
    if (location.hash && !location.hash.startsWith('#/')) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    }
  }
  function syncScene() {
    const conceptRoot = $('.concept-body'); if (!conceptRoot) return;
    $('[data-hud]', conceptRoot).hidden = toggles['hud'] === false;
    $('[data-keys]', conceptRoot).hidden = toggles['hotkeys'] === false;
    const enabled = modules.slice(0, 4).filter(m => toggles[m.id] !== false).length;
    $('.scene-status', conceptRoot).innerHTML = `<span class="dot"></span>${enabled} modules. Your way.`;
  }
  function setupObservers() {
    revealObserver?.disconnect(); sectionObserver?.disconnect();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if ('IntersectionObserver' in window && !reduced) {
      revealObserver = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObserver.unobserve(e.target); } }), { threshold: .08 });
      $$('.reveal').forEach(el => revealObserver.observe(el));
    } else $$('.reveal').forEach(el => el.classList.add('is-visible'));
    if (currentPage === 'home' && 'IntersectionObserver' in window) {
      sectionObserver = new IntersectionObserver(entries => entries.forEach(e => { if (!e.isIntersecting) return; const id = ['pricing', 'features', 'reviews'].includes(e.target.id) ? e.target.id : 'home'; $$('[data-nav]').forEach(a => { const active = a.dataset.nav === id; a.classList.toggle('active', active); if (active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); }); }), { rootMargin: '-12% 0px -68% 0px' });
      $$('main section[id]').forEach(el => sectionObserver.observe(el));
    }
    $$('[data-count]').forEach(el => { const target = Number(el.dataset.count); if (reduced) return; const start = performance.now(); const tick = now => { if (!el.isConnected) return; const p = Math.min((now - start) / 900, 1); el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  }
  async function hydrateData() {
    const pageAtRequest = currentPage;
    fetchDiscordSession().then(session => {
      discordSession = session;
      if ($('#account-content') && pageAtRequest === currentPage) { $('#account-content').innerHTML = accountPanel(currentPage === 'downloads'); window.HelixInjector?.mount(session.account); }
    });
    const [stats, reviews] = await Promise.all([fetchDiscordStats(), fetchReviews()]);
    if (pageAtRequest !== currentPage) return;
    $$('[data-discord-chip]').forEach(el => el.textContent = stats.available ? `${stats.members.toLocaleString()} members · ${stats.online.toLocaleString()} online` : 'Discord community');
    $$('[data-discord-counts]').forEach(el => el.innerHTML = stats.available ? `<span>${stats.members.toLocaleString()} members</span><span><span class="dot"></span>${stats.online.toLocaleString()} online</span>` : '<span><span class="dot"></span> Live status unavailable</span>');
    if (reviews.length && $('#hero-rating')) {
      const average = reviews.reduce((sum, r) => sum + Math.max(1, Math.min(5, Number(r.rating) || 1)), 0) / reviews.length;
      $('#hero-rating').innerHTML = `<div class="rating-pill"><span class="pill"><span class="stars">★★★★★</span>${average.toFixed(1)} · ${reviews.length} ${C.DEV_SAMPLE_DATA ? 'sample ' : ''}reviews</span><p id="rotating-quote"></p></div>`;
      let index = 0; const rotate = () => { const el = $('#rotating-quote'); if (el) el.textContent = `${C.DEV_SAMPLE_DATA ? 'SAMPLE · ' : ''}“${reviews[index % reviews.length].text}”`; index++; }; rotate();
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches && reviews.length > 1) quoteTimer = setInterval(rotate, 6500);
    }
  }
  document.addEventListener('click', async event => {
    const el = event.target.closest('button, a'); if (!el) return;
    if (el.closest('#overlay') && el.tagName === 'A' && el.getAttribute('href')?.startsWith('#')) closeDialog();
    if (el.dataset.theme) { applyTheme(el.dataset.theme); return; }
    if (el.dataset.detail) return detail(el.dataset.detail);
    if (el.dataset.toggle) { const id = el.dataset.toggle; toggles[id] = toggles[id] === false; storage.write('toggles', toggles); el.setAttribute('aria-checked', toggles[id]); syncScene(); return; }
    if (el.dataset.category) return chooseCategory(el.dataset.category);
    if (el.dataset.filter) { catalogCategory = el.dataset.filter; updateCatalog(); animateContent($('#catalog-grid')); return; }
    if (el.dataset.billing) { billing = el.dataset.billing; $('#plans').innerHTML = plans(); updateDays(); $(`[data-billing="${billing}"]`).focus({ preventScroll: true }); return; }
    if (el.dataset.days) { days = Math.max(C.pricing.minimumDays, Math.min(C.pricing.maximumDays, days + (el.dataset.days === 'plus' ? C.pricing.dayStep : -C.pricing.dayStep))); updateDays(); return; }
    if (el.dataset.showcaseFilter) { showcaseFilter = el.dataset.showcaseFilter; $('#showcase-grid').innerHTML = showcaseCards(); $$('[data-showcase-filter]').forEach(b => { const chosen = b.dataset.showcaseFilter === showcaseFilter; b.classList.toggle('active', chosen); b.setAttribute('aria-pressed', chosen); }); animateContent($('#showcase-grid')); return; }
    if (el.dataset.showcase) return lightbox(el.dataset.showcase);
    if (el.dataset.language) { language = el.dataset.language; storage.write('language', language); render(true); toast(ui('languageNote')); return; }
    switch (el.dataset.action) {
      case 'close-dialog': closeDialog(); break;
      case 'global-search': searchPalette(); break;
      case 'language-menu': { const menu = $('#language-menu'); menu.hidden = !menu.hidden; el.setAttribute('aria-expanded', String(!menu.hidden)); break; }
      case 'mobile-menu': openDialog('Your Helix.', `<nav class="mobile-nav" aria-label="Mobile navigation">${['home', 'modules', 'pricing', 'downloads', 'faq', 'dashboard'].map(k => `<a href="${k === 'home' ? '#home' : `#/${k}`}">${esc(nav(k))}</a>`).join('')}<a href="#/showcases">Showcases</a></nav>`); break;
      case 'all-reviews': showAllReviews = !showAllReviews; $('#review-content').innerHTML = reviewSection(); break;
      case 'checkout': beginCheckout(); break;
      case 'connect-discord': beginDiscordLogin(); break;
      case 'refresh-account': discordSession.loading = true; $('#account-content').innerHTML = accountPanel(currentPage === 'downloads'); hydrateData(); break;
      case 'logout': {
        try {
          const response = await fetch(C.discord.apiBase + '/logout', { method: 'POST', credentials: 'same-origin' });
          if (!response.ok) throw Error('Could not sign out');
          discordSession.account = null;
          render(true);
        } catch { toast('Could not sign out. Please try again.'); }
        break;
      }
      case 'join-discord': { const url = safeLink(C.links.discord); if (url) window.open(url, '_blank', 'noopener,noreferrer'); else toast(C.copy.notices.discord); break; }
      case 'submit-setup': { const url = safeLink(C.links.submitSetup); if (url) window.open(url, '_blank', 'noopener,noreferrer'); else toast(C.copy.notices.submit); break; }
      case 'reset-preferences': { try { ['language', 'toggles', 'accent'].forEach(k => localStorage.removeItem(`helix-${k}`)); } catch {} language = 'en'; Object.keys(toggles).forEach(k => delete toggles[k]); render(true); toast('Local preferences reset.'); break; }
    }
  });
  document.addEventListener('click', clickFeedback, { capture: true });
  document.addEventListener('input', event => {
    if (event.target.id === 'custom-days-range') { days = Number(event.target.value); updateDays(); }
    if (event.target.id === 'custom-days') { const value = Number(event.target.value); if (event.target.value !== '' && Number.isInteger(value) && value >= C.pricing.minimumDays && value <= C.pricing.maximumDays) { days = value; updateDays(); } }
    if (event.target.id === 'custom-theme') applyTheme(event.target.value);
    if (event.target.id === 'concept-search') $('#concept-modules').innerHTML = conceptRows(event.target.value);
    if (event.target.id === 'catalog-search') { catalogQuery = event.target.value; updateCatalog(); }
    if (event.target.id === 'global-search') updateGlobalSearch(event.target.value);
  });
  document.addEventListener('change', event => { if (event.target.id === 'custom-days') { const value = Number(event.target.value); days = Number.isFinite(value) && value >= C.pricing.minimumDays ? Math.min(C.pricing.maximumDays, Math.round(value)) : C.pricing.defaultDays; updateDays(); } });
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchPalette(); }
    if (event.key === 'Escape') { const menu = $('#language-menu'); if (menu) { menu.hidden = true; $('.language-toggle').setAttribute('aria-expanded', 'false'); } }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.language')) { const menu = $('#language-menu'); if (menu) { menu.hidden = true; $('.language-toggle').setAttribute('aria-expanded', 'false'); } } });
  $('#overlay').addEventListener('click', event => { if (event.target !== $('#overlay')) return; const rect = event.target.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(); });
  $('#overlay').addEventListener('close', () => { document.body.classList.remove('modal-open'); if (dialogReturnFocus?.isConnected) dialogReturnFocus.focus({ preventScroll: true }); });
  window.addEventListener('hashchange', () => render());
  function applyTheme(value) { const color = value === 'reset' ? C.brand.colors.accent : value; if (!/^#[0-9a-f]{6}$/i.test(color)) return; document.documentElement.style.setProperty('--accent', color); storage.write('accent', color); }
  Object.entries(C.brand.colors).forEach(([k, v]) => document.documentElement.style.setProperty(`--${k}`, v));
  Object.entries(C.brand.fonts).forEach(([k, v]) => document.documentElement.style.setProperty(`--font-${k}`, v));
  document.documentElement.style.setProperty('--radius', C.brand.radius);
  const savedAccent = storage.read('accent', null);
  if (savedAccent) applyTheme(savedAccent);
  render();
})();
