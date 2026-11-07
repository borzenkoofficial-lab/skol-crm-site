const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('main.js', 'utf8');
const motion = fs.readFileSync('motion-scene.mjs', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');

test('HTML includes all main navigation targets and the WebGL experience', () => {
  for (const id of ['top', 'experience', 'system', 'control', 'workflow', 'contact']) {
    assert.ok(html.includes('id="' + id + '"'), 'missing ' + id);
  }
  assert.ok(html.includes('id="motion-canvas"'));
  assert.ok(html.includes('src="/motion-scene.mjs"'));
});

test('cinematic motion stack is pinned to known CDN versions', () => {
  assert.ok(html.includes('gsap@3.15.1/dist/gsap.min.js'));
  assert.ok(html.includes('gsap@3.15.1/dist/ScrollTrigger.min.js'));
  assert.ok(motion.includes('three@0.187.0/build/three.module.js'));
});

test('cinematic camera follows a continuous spline path', () => {
  assert.ok(motion.includes('CatmullRomCurve3'));
  assert.ok(motion.includes('getPointAt(p)'));
  assert.ok(motion.includes('scrub: 1.05'));
});

test('scene includes a detailed architectural construction model', () => {
  assert.ok(motion.includes('tower crane'));
  assert.ok(motion.includes('Glass curtain wall'));
  assert.ok(motion.includes('level < 5'));
});

test('mobile menu exposes an initial accessible state', () => {
  assert.ok(html.includes('aria-expanded="false"'));
});

test('no invented contact address remains in the page', () => {
  assert.ok(!html.includes('hello@skolcrm.ru'));
  assert.ok(html.includes('Контакты для демонстрации уточняются'));
});

test('motion has a reduced-motion and WebGL fallback', () => {
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
  assert.ok(js.includes('prefers-reduced-motion'));
  assert.ok(motion.includes('motion-fallback'));
  assert.ok(motion.includes('prefers-reduced-motion'));
});

test('main and 3D motion JavaScript parse', () => {
  assert.doesNotThrow(() => new vm.Script(js));
  assert.ok(motion.includes('ScrollTrigger'));
  assert.ok(motion.includes('WebGLRenderer'));
  assert.ok(motion.includes('cameraPath'));
});
