/* Track 3: local temporal monitoring of TikTok and Instagram/Facebook Reels. */
(() => {
  'use strict';
  if (globalThis.__sensoryShield) return;
  const states = new Map();
  let enabled = false, observer, timer, interval, host, ui;
  const signature = video => video.currentSrc || video.getAttribute('src') || '';
  const domain = (host, name) => host === name || host.endsWith('.' + name);
  function isTarget(video, url = location.href) {
    if (video.tagName !== 'VIDEO') return false;
    const { hostname, pathname } = new URL(url);
    if (domain(hostname, 'tiktok.com')) return true;
    if (!domain(hostname, 'instagram.com') && !domain(hostname, 'facebook.com')) return false;
    return /\/(reels?|reel)\//i.test(pathname + '/') || !!video.closest('[data-pagelet*="Reel"], [data-e2e*="reel"]') ||
      !!video.closest('article')?.querySelector('a[href*="/reel/"]');
  }
  function visible(video) {
    const r = video.getBoundingClientRect(), s = getComputedStyle(video);
    return s.display !== 'none' && r.width > 40 && r.height > 40 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
  }
  // Conservative heuristic: count repeated, opposing large-area luminance/red changes.
  // This is not a WCAG conformance test or a medical safety determination.
  function assessFrame(state, pixels, time) {
    if (!state.previous || time - state.lastTime > 250 || time <= state.lastTime) {
      state.previous = new Uint8ClampedArray(pixels); state.lastTime = time;
      state.transitions = []; state.direction = 0; return false;
    }
    let up = 0, down = 0;
    const previous = state.previous;
    for (let i = 0; i < pixels.length; i += 4) {
      const luminance = p => (p[i] * .2126 + p[i + 1] * .7152 + p[i + 2] * .0722) / 255;
      const delta = luminance(pixels) - luminance(previous);
      const red = p => Math.max(0, (p[i] - (p[i + 1] + p[i + 2]) / 2) / 255);
      const redDelta = red(pixels) - red(previous);
      if (delta > .18 || redDelta > .25) up++;
      if (delta < -.18 || redDelta < -.25) down++;
    }
    const area = pixels.length / 4;
    const direction = up / area >= .2 ? 1 : down / area >= .2 ? -1 : 0;
    state.transitions = state.transitions.filter(t => time - t < 1000);
    if (direction && direction !== state.direction) {
      state.transitions.push(time); state.direction = direction;
    }
    previous.set(pixels); state.lastTime = time;
    return state.transitions.length >= 6;
  }
  function ensureUI() {
    if (host) return;
    host = document.createElement('div'); host.id = 'sensory-shield-ui';
    host.style.cssText = 'position:fixed!important;inset:0!important;pointer-events:none!important;z-index:2147483647!important;background:transparent!important;';
    ui = host.attachShadow({ mode: 'closed' });
    const style = document.createElement('style');
    style.textContent = `:host{all:initial}*{box-sizing:border-box}.card{position:fixed;overflow:auto;background:#f0e9da;color:#302d27;border:1px solid #a79a7d;padding:20px;font:15px/1.5 system-ui;pointer-events:auto;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:12px;text-align:center}p,h2{margin:0;max-width:34ch}h2{font-size:19px}button{font:inherit;background:#ded2ba;color:#25241e;border:1px solid #897e69;border-radius:6px;padding:10px 14px;cursor:pointer}button:focus-visible{outline:3px solid #715a30;outline-offset:2px}`;
    ui.append(style); document.documentElement.append(host);
  }
  function cancel(state) {
    if (state.frameId != null) state.video.cancelVideoFrameCallback?.(state.frameId);
    clearTimeout(state.fallback); state.frameId = null; state.fallback = null;
  }
  function uncover(state) {
    state.card?.remove(); state.card = null;
    if (state.originalVisibility && state.video.style.getPropertyValue('visibility') === 'hidden') {
      const [value, priority] = state.originalVisibility;
      if (value) state.video.style.setProperty('visibility', value, priority);
      else state.video.style.removeProperty('visibility');
    }
    state.originalVisibility = null;
  }
  function dispose(state) { cancel(state); uncover(state); states.delete(state.video); }
  function position() {
    for (const state of states.values()) {
      if (!state.video.isConnected) { dispose(state); continue; }
      if (!state.card) continue;
      const r = state.video.getBoundingClientRect();
      const top = Math.max(0, r.top), left = Math.max(0, r.left);
      const width = Math.max(0, Math.min(innerWidth, r.right) - left);
      const height = Math.max(0, Math.min(innerHeight, r.bottom) - top);
      state.card.style.cssText = `top:${top}px;left:${left}px;width:${width}px;height:${height}px;display:${width && height ? 'flex' : 'none'}`;
    }
  }
  function skip(state) {
    state.decision = 'skip'; state.video.pause();
    state.title.textContent = 'Video skipped';
    state.description.textContent = 'This video stays hidden. Scroll to continue.';
    state.skipButton.remove();
    // Navigate only to an actual next video already present; no synthetic keys or unrelated clicks.
    const next = [...document.querySelectorAll('video')].filter(v => isTarget(v) && v !== state.video)
      .find(v => v.getBoundingClientRect().top > state.video.getBoundingClientRect().top + 40);
    next?.scrollIntoView({ behavior: 'instant', block: 'center' });
  }
  function warn(state, unknown = false) {
    if (state.card || state.decision) return;
    cancel(state); state.video.pause(); state.result = unknown ? 'unavailable' : 'warning';
    const video = state.video;
    state.originalVisibility = [video.style.getPropertyValue('visibility'), video.style.getPropertyPriority('visibility')];
    video.style.setProperty('visibility', 'hidden', 'important');
    ensureUI();
    const card = document.createElement('section'); card.className = 'card';
    card.setAttribute('aria-label', 'Video sensory warning'); card.setAttribute('role', 'region');
    const title = document.createElement('h2'); title.textContent = unknown ? 'This video could not be checked' : 'Possible flashing detected';
    const description = document.createElement('p');
    description.textContent = unknown ? 'The browser blocked access to video frames. Flashing risk is unknown.' : 'Rapid brightness or red-color changes may affect people with photosensitivity.';
    const proceed = document.createElement('button'); proceed.type = 'button'; proceed.textContent = 'Proceed at your own risk';
    proceed.addEventListener('click', () => {
      state.decision = 'proceed'; uncover(state);
      video.play()?.catch(() => { state.result = 'Playback paused — use the video controls'; });
      video.focus({ preventScroll: true });
    });
    const skipButton = document.createElement('button'); skipButton.type = 'button'; skipButton.textContent = 'Skip video';
    skipButton.addEventListener('click', () => skip(state));
    Object.assign(state, { card, title, description, skipButton });
    card.append(title, description, skipButton, proceed); ui.append(card); position();
  }
  function sample(state, now, mediaTime) {
    if (!enabled || states.get(state.video) !== state || state.decision || state.card) return;
    const video = state.video;
    if (signature(video) !== state.source || !isTarget(video)) { dispose(state); schedule(); return; }
    if (document.hidden || !visible(video) || video.paused || video.ended) { cancel(state); state.previous = null; return; }
    if (video.readyState >= 2 && video.videoWidth > 0 && mediaTime !== state.mediaTime) {
      state.mediaTime = mediaTime;
      try {
        state.context.drawImage(video, 0, 0, 64, 36);
        const pixels = state.context.getImageData(0, 0, 64, 36).data;
        if (assessFrame(state, pixels, now)) { warn(state); return; }
        state.result = 'Monitoring';
      } catch { warn(state, true); return; }
    }
    queue(state);
  }
  function queue(state) {
    if (state.video.requestVideoFrameCallback) {
      state.frameId = state.video.requestVideoFrameCallback((now, metadata) => {
        state.frameId = null; sample(state, now, metadata.mediaTime);
      });
    } else state.fallback = setTimeout(() => { state.fallback = null; sample(state, performance.now(), state.video.currentTime); }, 33);
  }
  function track(video) {
    let state = states.get(video);
    if (state && state.source !== signature(video)) { dispose(state); state = null; }
    if (!state) {
      const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 36;
      state = { video, source: signature(video), context: canvas.getContext('2d', { willReadFrequently: true }), result: 'Waiting for playback' };
      states.set(video, state);
      if (!state.context) { warn(state, true); return; }
    }
    if (!state.card && !state.decision && state.frameId == null && state.fallback == null && !video.paused) queue(state);
  }
  function scan() {
    if (!enabled) return;
    for (const state of states.values()) {
      if (!state.video.isConnected || !isTarget(state.video) || state.source !== signature(state.video)) dispose(state);
      else if (!visible(state.video) || document.hidden) { cancel(state); state.previous = null; }
    }
    if (!document.hidden) for (const video of document.querySelectorAll('video')) if (isTarget(video) && visible(video)) track(video);
    position();
  }
  function schedule() {
    position();
    if (enabled && !timer) timer = setTimeout(() => { timer = null; scan(); }, 150);
  }
  function setEnabled(value) {
    if (enabled === value) return;
    enabled = value;
    if (enabled) {
      observer = new MutationObserver(schedule);
      observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
      scan(); interval = setInterval(scan, 1000);
    } else {
      observer?.disconnect(); clearInterval(interval); clearTimeout(timer); timer = null;
      for (const state of states.values()) dispose(state);
      host?.remove(); host = null; ui = null;
    }
  }
  function status() {
    const values = [...states.values()];
    return { enabled, protectedCount: values.filter(s => s.card).length,
      aiStatus: `${values.length} TikTok/Reel videos tracked. ${values.filter(s => s.result === 'unavailable').length} could not be checked. Analysis runs locally during playback.` };
  }
  globalThis.__sensoryShield = { isTarget, assessFrame, status,
    apply(video, report) { if (video.tagName !== 'VIDEO' || report.overallRisk === 'low') return;
      const state = { video, source: signature(video) }; if (!states.has(video)) { states.set(video, state); warn(state); } },
    reset(video) { const state = states.get(video); if (state) dispose(state); }
  };
  if (typeof chrome === 'undefined' || !chrome.runtime?.id) return;
  document.addEventListener('play', event => {
    if (!enabled || !isTarget(event.target)) return;
    const state = states.get(event.target);
    if (state?.source === signature(event.target) && state.card) event.target.pause();
    else if (visible(event.target)) track(event.target);
  }, true);
  document.addEventListener('loadstart', event => {
    const state = states.get(event.target); if (state) dispose(state); schedule();
  }, true);
  document.addEventListener('visibilitychange', scan);
  addEventListener('scroll', schedule, { passive: true, capture: true });
  addEventListener('resize', schedule, { passive: true });
  document.addEventListener('keydown', event => {
    if (event.altKey && event.code === 'KeyV' && !event.repeat) { event.preventDefault(); scan(); }
  });
  chrome.storage.local.get({ sensoryShieldEnabled: false }).then(result => setEnabled(result.sensoryShieldEnabled));
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.sensoryShieldEnabled) setEnabled(!!changes.sensoryShieldEnabled.newValue);
  });
  chrome.runtime.onMessage.addListener((message, sender, reply) => {
    if (message.action === 'SET_SENSORY_SHIELD_ENABLED') setEnabled(!!message.enabled);
    else if (message.action === 'TRIGGER_SENSORY_SCAN') scan();
    else if (message.action !== 'GET_SENSORY_STATUS') return;
    reply({ ok: true, data: status() });
  });
})();
