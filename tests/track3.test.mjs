import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const base = 'ai-accessibility-extension/extension/';
function scanner() {
  const context = { URL, chrome: { runtime: { onMessage: { addListener() {} } }, storage: { local: { get: async () => ({ sensoryShieldEnabled: false }) }, onChanged: { addListener() {} } } }, document: { addEventListener() {} }, addEventListener() {}, innerWidth: 1000, innerHeight: 800,
    getComputedStyle: el => ({ display: 'block', animationName: 'none', animationDuration: '0s', animationIterationCount: '1', backgroundColor: 'rgba(0, 0, 0, 0)', ...el.style }) };
  vm.runInNewContext(readFileSync(base + 'sensory-shield.js', 'utf8'), context);
  return context.__sensoryShield;
}
const video = { tagName: 'VIDEO', closest: () => null };
test('targets TikTok and Reels, excluding other pages and non-video elements', () => {
  const { isTarget } = scanner();
  assert.equal(isTarget(video, 'https://www.tiktok.com/@user/video/123'), true);
  assert.equal(isTarget(video, 'https://www.instagram.com/reels/123/'), true);
  assert.equal(isTarget(video, 'https://www.facebook.com/reel/123'), true);
  assert.equal(isTarget(video, 'https://www.instagram.com/stories/user'), false);
  assert.equal(isTarget(video, 'https://www.tiktok.com.evil.test/video/1'), false);
  assert.equal(isTarget({ tagName: 'DIV' }, 'https://www.tiktok.com'), false);
});
const frame = (value, count = 16) => new Uint8ClampedArray(Array.from({ length: count }, () => [value, value, value, 255]).flat());
test('warns on repeated opposing large brightness transitions', () => {
  const { assessFrame } = scanner(), state = {};
  let warning = false;
  for (let i = 0; i <= 6; i++) warning = assessFrame(state, frame(i % 2 ? 255 : 0), 1000 + i * 100);
  assert.equal(warning, true);
});
test('does not warn on static bright frames, one scene cut, or slow changes', () => {
  const { assessFrame } = scanner();
  for (const mode of ['static', 'cut', 'slow']) {
    const state = {};
    for (let i = 0; i < 20; i++) {
      const value = mode === 'static' ? 255 : mode === 'cut' ? (i < 5 ? 0 : 255) : i % 2 * 255;
      assert.equal(assessFrame(state, frame(value), 1000 + i * (mode === 'slow' ? 400 : 50)), false);
    }
  }
});
test('ignores tiny flashing regions and resets after a sampling gap', () => {
  const { assessFrame } = scanner(), state = {};
  for (let i = 0; i < 20; i++) {
    const pixels = frame(0); pixels.set([i % 2 * 255, i % 2 * 255, i % 2 * 255, 255], 0);
    assert.equal(assessFrame(state, pixels, 1000 + i * 50), false);
  }
  assert.equal(assessFrame(state, frame(255), 5000), false);
});
async function bridge(message, activeId = 3) {
  let listener, captures = 0, posted;
  const context = { AbortController, setTimeout, clearTimeout, console,
    fetch: async (url, options) => { posted = JSON.parse(options.body); return { ok: true, json: async () => ({ overallRisk: 'low', triggers: [] }) }; },
    chrome: { runtime: { onMessage: { addListener(fn) { listener = fn; } } }, tabs: {
      query: async () => [{ id: activeId }], captureVisibleTab: async () => { captures++; return 'data:image/jpeg;base64,YQ=='; }
    } } };
  vm.runInNewContext(readFileSync(base + 'background.js', 'utf8'), context);
  const response = await new Promise(resolve => listener(message, { tab: { id: 3, windowId: 2 }, frameId: 0 }, resolve));
  return { response, captures, posted };
}
test('bridge honors standardized base64Image contract', async () => {
  const image = 'data:image/jpeg;base64,YQ==';
  const result = await bridge({ action: 'ANALYZE_SENSORY_RISK', base64Image: image });
  assert.equal(result.posted.base64Image, image); assert.equal(result.response.ok, true); assert.equal(result.captures, 0);
});
test('capture rejects inactive sender and malformed images', async () => {
  const result = await bridge({ action: 'CAPTURE_SENSORY_VIEWPORT' }, 4);
  assert.equal(result.response.ok, false); assert.equal(result.captures, 0);
  assert.equal((await bridge({ action: 'ANALYZE_SENSORY_RISK', base64Image: '<script>' })).response.ok, false);
});

test('warning controls pause only the video, proceed resumes, skip stays paused, reset restores visibility', () => {
  const nodes = [];
  function node(tagName) {
    const properties = new Map();
    const el = { tagName, children: [], isConnected: true,
      style: { getPropertyValue: name => properties.get(name)?.[0] || '', getPropertyPriority: name => properties.get(name)?.[1] || '',
        setProperty: (name, value, priority) => properties.set(name, [value, priority]), removeProperty: name => properties.delete(name) },
      append(...children) { this.children.push(...children); }, attachShadow() { return node('SHADOW'); },
      setAttribute() {}, addEventListener(name, fn) { this[name] = fn; }, remove() { this.removed = true; },
      getBoundingClientRect: () => ({ top: 100, left: 200, right: 600, bottom: 700, width: 400, height: 600 }),
      getAttribute: () => '', focus() {}, currentSrc: 'blob:video', pause() { this.paused = true; }, play() { this.paused = false; return Promise.resolve(); }
    };
    nodes.push(el); return el;
  }
  const root = node('HTML');
  const context = { URL, clearTimeout, innerWidth: 1000, innerHeight: 800,
    document: { documentElement: root, createElement: node, querySelectorAll: () => [] } };
  vm.runInNewContext(readFileSync(base + 'sensory-shield.js', 'utf8'), context);
  const shield = context.__sensoryShield, target = node('VIDEO');
  shield.apply(target, { overallRisk: 'high' });
  assert.equal(target.paused, true);
  assert.equal(target.style.getPropertyValue('visibility'), 'hidden');
  assert.equal(root.style.getPropertyValue('visibility'), '');
  assert.equal(root.style.getPropertyValue('filter'), '');
  nodes.find(n => n.textContent === 'Proceed at your own risk').click();
  assert.equal(target.paused, false);
  assert.equal(target.style.getPropertyValue('visibility'), '');
  shield.reset(target);
  shield.apply(target, { overallRisk: 'high' });
  nodes.filter(n => n.textContent === 'Skip video').at(-1).click();
  assert.equal(target.paused, true);
  assert.equal(target.style.getPropertyValue('visibility'), 'hidden');
  shield.reset(target);
  assert.equal(target.style.getPropertyValue('visibility'), '');
  assert.equal(target.paused, true);
});
