const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('main.js', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');

test('HTML includes the main navigation targets and cinematic sequence', () => {
  for (const id of ['top', 'experience', 'system', 'control', 'workflow', 'contact']) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  assert.match(html, /id="film-canvas"/);
});
test('mobile menu exposes an initial accessible state', () => {
  assert.match(html, /class="menu-toggle"[^>]*aria-expanded="false"/);
});
test('no invented contact address remains in the page', () => {
  assert.doesNotMatch(html, /hello@skolcrm\.ru/);
  assert.match(html, /Контакты для демонстрации уточняются/);
});
test('motion has a reduced-motion fallback', () => {
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(js, /prefers-reduced-motion/);
});
test('main JavaScript parses', () => {
  assert.doesNotThrow(() => new vm.Script(js));
});
