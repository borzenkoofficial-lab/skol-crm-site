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
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  assert.match(html, /id="motion-canvas"/);
  assert.match(html, /src="\\/motion-scene\\.mjs"/);
});

test('cinematic motion stack is pinned to known CDN versions', () => {
  assert.match(html, /gsap@3\\.15\\.1\\/dist\\/gsap\\.min\\.js/);
  assert.match(html, /gsap@3\\.15\\.1\\/dist\\/ScrollTrigger\\.min\\.js/);
  assert.match(motion, /three@0\\.187\\.0\\/build\\/three\\.module\\.js/);
});

test('cinematic camera follows a continuous spline path', () => {
  assert.match(motion, /CatmullRomCurve3/);
  assert.match(motion, /getPointAt\\(p\\)/);
  assert.match(motion, /scrub:\\s*1\\.05/);
});

test('scene includes a detailed architectural construction model', () => {
  assert.match(motion, /Tower crane/);
  assert.match(motion, /Glass curtain wall/);
  assert.match(motion, /levels = 5/);
});

test('mobile menu exposes an initial accessible state', () => {
  assert.match(html, /class="menu-toggle"[^>]*aria-expanded="false"/);
});

test('no invented contact address remains in the page', () => {
  assert.doesNotMatch(html, /hello@skolcrm\\.ru/);
  assert.match(html, /Контакты для демонстрации уточняются/);
});

test('motion has a reduced-motion and WebGL fallback', () => {
  assert.match(css, /prefers-reduced-motion:\\s*reduce/);
  assert.match(js, /prefers-reduced-motion/);
  assert.match(motion, /motion-fallback/);
  assert.match(motion, /prefers-reduced-motion/);
});

test('main and 3D motion JavaScript parse', () => {
  assert.doesNotThrow(() => new vm.Script(js));
  assert.match(motion, /ScrollTrigger/);
  assert.match(motion, /WebGLRenderer/);
  assert.match(motion, /cameraPath/);
});
