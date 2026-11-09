const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('main.js', 'utf8');
const motion = fs.readFileSync('motion-scene.mjs', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const showcaseJs = fs.readFileSync('product-showcase.js', 'utf8');
const showcaseCss = fs.readFileSync('product-showcase.css', 'utf8');

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

test('cinematic camera follows a continuous spline path without cumulative roll drift', () => {
  assert.ok(motion.includes('CatmullRomCurve3'));
  assert.ok(motion.includes('getPointAt(p)'));
  assert.ok(motion.includes('scrub: 1.05'));
  assert.ok(motion.includes('camera.rotation.z = shot(2)'));
  assert.ok(motion.includes('const shotTrack = ['));
  assert.ok(motion.includes('const nextFov = shot(1)'));
  assert.ok(motion.includes('camera.rotation.z +=') === false);
  assert.ok(motion.includes('camera.updateProjectionMatrix()'));
});

test('3D information cards keep their frame attached during motion', () => {
  assert.ok(motion.includes('const rig = new THREE.Group()'));
  assert.ok(motion.includes('rig.add(card)'));
  assert.ok(motion.includes('rig.add(frame)'));
  assert.ok(motion.includes('return rig'));
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

test('hero product interface uses real CRM modules and avoids fabricated dashboard values', () => {
  for (const label of ['АКТИВНЫЕ ЗАЯВКИ', 'АКТИВНЫЕ ОБЪЕКТЫ', 'КЛИЕНТЫ В БАЗЕ', 'ДВИЖЕНИЕ ЗАЯВОК', 'Объекты', 'Финансы']) assert.ok(html.includes(label), 'missing real CRM module: ' + label);
  assert.ok(html.includes('реальные показатели берутся из локальной базы программы'));
  assert.ok(!html.includes('БЦ «Север»'));
  assert.ok(!html.includes('₽ 8.42'));
  assert.ok(!html.includes('₽ 684 200'));
  assert.ok(!html.includes('width:82%'));
  assert.ok(!html.includes('width:67%'));
  assert.ok(!html.includes('62%'));
  assert.ok(!html.includes('09:41'));
});
test('product showcase tabs are accessible and backed by a separate interaction module', () => {
  assert.ok(html.includes('role="tablist"'));
  assert.ok(html.includes('data-showcase-tab="overview"'));
  assert.ok(html.includes('data-showcase-panel="finance"'));
  assert.ok(html.includes('src="/product-showcase.js"'));
  assert.ok(html.includes('href="/product-showcase.css"'));
  assert.doesNotThrow(() => new vm.Script(showcaseJs));
  assert.ok(showcaseCss.includes('.product-screen-tab.is-active'));
  assert.ok(showcaseJs.includes("ArrowLeft"));
  assert.ok(showcaseJs.includes("ArrowRight"));
});
test('finance messaging preserves the distinction between cash balance and profit', () => {
  assert.ok(html.includes('Это не прибыль и не банковский баланс'));
  assert.ok(html.includes('не подменяет фактические данные прогнозом'));
});

test('scroll-driven particles morph through the four product chapters', () => {
  for (let i = 0; i < 4; i++) assert.ok(motion.includes('particleTargets[' + i + ']'));
  assert.ok(motion.includes('particleGeometry.attributes.position.needsUpdate = true'));
  assert.ok(motion.includes('const morphPosition = p * 3'));
});
test('marketing visuals do not imply fabricated object IDs, margin values or live activity', () => {
  assert.ok(!html.includes('ОБЪЕКТ / 024'));
  assert.ok(!html.includes('Маржинальность под контролем'));
  assert.ok(!html.includes('ЗАДАЧА ЗАКРЫТА'));
  assert.ok(html.includes('ДОКУМЕНТЫ ОБЪЕКТА'));
});

test('cinematic camera uses distinct close-up and wide master-shot lenses', () => {
  assert.ok(motion.includes('[0.12, 27'));
  assert.ok(motion.includes('[0.43, 25'));
  assert.ok(motion.includes('[0.73, 24'));
  assert.ok(motion.includes('[1, 43'));
  assert.ok(motion.includes('sampleTrack(p, shotTrack, column)'));
});
test('camera framing includes restrained pointer parallax and no cumulative transform drift', () => {
  assert.ok(motion.includes('pointerX * (mobile ? 0.035 : 0.11)'));
  assert.ok(motion.includes('pointerY * (mobile ? 0.025 : 0.075)'));
  assert.ok(!motion.includes('camera.rotation.z +='));
});

test('architectural frame and glass facade unfold in separate scroll beats', () => {
  assert.ok(motion.includes('const frameBuild = smooth((p - 0.16) / 0.19)'));
  assert.ok(motion.includes('const facadeOpen = smooth((p - 0.31) / 0.14)'));
  assert.ok(motion.includes('facadePanels.forEach'));
  assert.ok(motion.includes('building.scale.y = mix(0.055, 1, frameBuild)'));
});
test('finance columns rise and transfer paths progressively connect to the control core', () => {
  assert.ok(motion.includes('const financeBuild = smooth((p - 0.445) / 0.13)'));
  assert.ok(motion.includes('const transferProgress = smooth((p - 0.59) / 0.19)'));
  assert.ok(motion.includes('geometry.setDrawRange(0, Math.floor(total * transferProgress))'));
  assert.ok(motion.includes('transferCurves[i].getPointAt'));
});

test('operational modules section covers the real CRM workflow without fabricated metrics', () => {
  assert.ok(html.includes('id="modules"'));
  for (const label of ['Заявки и клиенты', 'Бригады и производство', 'Задачи и сроки', 'Документы и история']) assert.ok(html.includes(label), 'missing module: ' + label);
  assert.ok(html.includes('data-tilt'));
  assert.ok(css.includes('.modules-grid{display:grid'));
  assert.ok(css.includes('.module-card.reveal.is-visible{transform:perspective(900px)'));
  assert.ok(css.includes('@media(prefers-reduced-motion:reduce){.module-card'));
  assert.ok(js.includes("querySelectorAll('[data-tilt]')"));
});

test('global cinematic interaction layer is pointer-safe and reduced-motion aware', () => {
  assert.ok(html.includes('id="pointer-aura"'));
  assert.ok(html.includes('id="cursor-reticle"'));
  assert.ok(js.includes('Global pointer field'));
  assert.ok(js.includes('IntersectionObserver'));
  assert.ok(css.includes('.pointer-aura{position:fixed'));
  assert.ok(css.includes('@keyframes finance-sweep'));
  assert.ok(css.includes('@keyframes closing-aura'));
  assert.ok(css.includes('@media(prefers-reduced-motion:reduce){.pointer-aura'));
});


test('WebGL animation pauses when the tab is hidden and recovers after context restoration', () => {
  assert.ok(motion.includes("document.addEventListener('visibilitychange'"));
  assert.ok(motion.includes("canvas.addEventListener('webglcontextlost'"));
  assert.ok(motion.includes("canvas.addEventListener('webglcontextrestored'"));
  assert.ok(motion.includes('const canAnimate = () => active && pageVisible && !contextLost && !reduced'));
});


test('camera pointer response is damped and frame-rate independent', () => {
  assert.ok(motion.includes('targetPointerX'));
  assert.ok(motion.includes('const pointerEase = 1 - Math.exp(-delta * 5.5)'));
  assert.ok(motion.includes('const frameScale = delta * 60'));
  assert.ok(motion.includes('0.00045 * frameScale'));
});
