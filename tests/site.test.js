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

test('3D scene allocates product and workflow geometry without unused architecture', () => {
  assert.ok(motion.includes('const software = new THREE.Group()'));
  assert.ok(motion.includes('const input = new THREE.Group()'));
  assert.ok(motion.includes('const finance = new THREE.Group()'));
  assert.ok(!motion.includes('const building = new THREE.Group()'));
  assert.ok(!motion.includes('tower crane'));
  assert.ok(!motion.includes('facadePanels'));
});

test('mobile menu exposes an initial accessible state', () => {
  assert.ok(html.includes('aria-expanded="false"'));
});

test('no invented contact address or unavailable CTA remains in the page', () => {
  assert.ok(!html.includes('hello@skolcrm.ru'));
  assert.ok(!html.includes('Контакты для демонстрации уточняются'));
  assert.ok(html.includes('<a class="closing-cta" href="#crm-tour">Посмотреть программу'));
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
  assert.ok(motion.includes('[0.36, 24'));
  assert.ok(motion.includes('[0.52, 24'));
  assert.ok(motion.includes('[0.73, 24'));
  assert.ok(motion.includes('[1, 43'));
  assert.ok(motion.includes('sampleTrack(p, shotTrack, column)'));
});
test('camera framing includes restrained pointer parallax and no cumulative transform drift', () => {
  assert.ok(motion.includes('pointerX * (mobile ? 0.035 : 0.11)'));
  assert.ok(motion.includes('pointerY * (mobile ? 0.025 : 0.075)'));
  assert.ok(!motion.includes('camera.rotation.z +='));
});

test('CRM workspace particles morph into five distinct screen surfaces', () => {
  assert.ok(motion.includes('const screens = ['));
  assert.ok(motion.includes('const panel = screens[i % screens.length]'));
  assert.ok(motion.includes('particleTargets[1][i * 3 + 1] = panel.y + localY'));
  assert.ok(motion.includes('const uiReveal = smooth((p - 0.19) / 0.16)'));
  assert.ok(!motion.includes('frameBuild'));
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

test('cinematic key light follows the four chapter focus points without frame accumulation', () => {
  assert.ok(motion.includes('const scanLight = new THREE.PointLight'));
  assert.ok(motion.includes('const lightTrack = ['));
  assert.ok(motion.includes('scanLight.position.set(sampleTrack(p, lightTrack, 1)'));
  assert.ok(motion.includes('scanLight.intensity = sampleTrack(p, lightTrack, 4)'));
});

test('cinematic depth uses restrained focal-plane parallax, atmospheric falloff and bounded lens breathing', () => {
  assert.ok(motion.includes('target.x + shot(6) + pointerX *'));
  assert.ok(motion.includes('target.y + shot(7) - pointerY *'));
  assert.ok(motion.includes('scene.fog.density = mix(0.026, 0.017'));
  assert.ok(motion.includes('const lensBreath = Math.sin(p * Math.PI * 8) * 0.32'));
  assert.ok(motion.includes('const resolvedFov = nextFov + lensBreath'));
});

test('all editorial sections share the cinematic graphite, lime and glass visual system', () => {
  for (const token of [
    'Unified cinematic design language',
    '.manifesto,.modules,.feature-light',
    '.manifesto-aside{',
    '.module-card{',
    '.workflow-step{',
    'backdrop-filter:blur(16px)',
    'prefers-reduced-motion:reduce'
  ]) assert.ok(css.includes(token), 'missing design-system rule: ' + token);
  assert.ok(css.includes('footer{'));
  assert.ok(css.includes('background:#090d09'));
  assert.ok(css.includes('.closing{'));
});


test('interactive cards clamp pointer coordinates and reset safely on pointer cancellation', () => {
  assert.ok(js.includes('Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))'));
  assert.ok(js.includes('Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))'));
  assert.ok(js.includes("card.addEventListener('pointercancel', resetTilt)"));
  assert.ok(js.includes('if (!rect.width || !rect.height) return'));
});

test('workflow cards participate in the same accessible pointer-tilt system', () => {
  for (const step of ['01','02','03','04']) assert.ok(html.includes('workflow-step reveal" data-tilt><b>'+step+'</b>'));
  assert.ok(css.includes('.workflow-step.reveal.is-visible{transform:perspective(900px)'));
  assert.ok(css.includes('.workflow-step:before'));
  assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
});

test('CRM product tour presents five distinct screens matching the supplied desktop workflow', () => {
  for (const label of ['Обзор бизнеса', 'Заявки и клиенты', 'Объекты', 'ПИ · расчёт объекта', 'Радар заказов']) assert.ok(html.includes(label), 'missing CRM tour stage: ' + label);
  for (let i = 0; i < 5; i++) {
    assert.ok(html.includes('data-crm-step="' + i + '"'));
    assert.ok(html.includes('data-crm-view="' + i + '"'));
  }
  assert.ok(html.includes('Центр привлечения заказов'));
  assert.ok(html.includes('ЕИС / закупки'));
  assert.ok(html.includes('crm-app-dock'));
});
test('CRM tour is a scroll-driven pinned experience with accessible manual navigation', () => {
  const tourJs = fs.readFileSync('crm-product-tour.js', 'utf8');
  const tourCss = fs.readFileSync('crm-product-tour.css', 'utf8');
  assert.doesNotThrow(() => new vm.Script(tourJs));
  assert.ok(tourJs.includes('requestAnimationFrame'));
  assert.ok(tourJs.includes('window.scrollTo'));
  assert.ok(tourJs.includes('aria-current'));
  assert.ok(tourCss.includes('position:sticky'));
  assert.ok(tourCss.includes('prefers-reduced-motion:reduce'));
});
test('CRM tour does not invent customer data or claim a live database connection', () => {
  for (const forbidden of ['ООО Ромашка', 'БЦ Север', '₽ 684 200', '100 000 000']) assert.ok(!html.includes(forbidden));
  assert.ok(html.includes('Показатели не заполнены демонстрационными цифрами'));
  assert.ok(html.includes('локальной базы'));
});

test('CRM tour keeps the floating dock selection synchronized with the active product screen', () => {
  const tourJs = fs.readFileSync('crm-product-tour.js', 'utf8');
  assert.ok(tourJs.includes('dockIndexByStep'));
  assert.ok(tourJs.includes("item.classList.toggle('is-active'"));
  assert.ok(fs.readFileSync('crm-product-tour.css', 'utf8').includes('padding:clamp(82px,9vh,112px)'));
});

test('3D product chapter stages five floating CRM workspaces instead of relying only on an architectural building', () => {
  for (const label of ['Обзор бизнеса', 'Заявки и клиенты', 'Объекты', 'ПИ · Расчёт', 'Финансы']) assert.ok(motion.includes("title: '" + label + "'"), 'missing floating CRM screen: ' + label);
  assert.ok(motion.includes('const software = new THREE.Group()'));
  assert.ok(motion.includes('new THREE.PlaneGeometry(w, h)'));
  assert.ok(motion.includes('makeUiTexture'));
  assert.ok(motion.includes('softwareScreens.forEach'));
  assert.ok(motion.includes('const uiReveal = smooth((p - 0.19) / 0.16)'));
  assert.ok(motion.includes('const uiGather = smooth((p - 0.78) / 0.2)'));
  assert.ok(motion.includes('Thin luminous links make the five product surfaces read as one connected workspace'));
});
test('floating CRM screens use truthful blank values and a readable product UI texture', () => {
  assert.ok(motion.includes("ctx.fillText('—'"));
  assert.ok(motion.includes("ctx.fillText('СКОЛ'"));
  assert.ok(motion.includes("ctx.fillText('CRM'"));
  assert.ok(!motion.includes('₽ 684 200'));
});


test('floating CRM presentation is independent from the collapsing architectural model', () => {
  assert.ok(motion.includes('const software = new THREE.Group();\n  scene.add(software);'));
  assert.ok(!motion.includes('building.add(software)'));
  assert.ok(motion.includes('const groups = [input, finance, control, software]'));
  assert.ok(motion.includes('[[0, 0], [0.18, 0], [0.25, 0.35], [0.33, 1], [0.67, 1], [0.8, 0.72], [0.9, 0.18], [1, 0]]'));
});

test('five 3D CRM screens use workflow-specific labels without invented KPI values', () => {
  assert.ok(motion.includes('const metricLabels = ['));
  assert.ok(motion.includes('const workspaceTitles ='));
  assert.ok(motion.includes('const workspaceRows = ['));
  assert.ok(motion.includes("ctx.fillText('—'"));
  assert.ok(!motion.includes('₽ 684 200'));
});

test('CRM tour keeps inactive screens out of the keyboard focus order', () => {
  const tourJs = fs.readFileSync('crm-product-tour.js', 'utf8');
  assert.ok(tourJs.includes('view.inert = !selected'));
  assert.ok(tourJs.includes('const goTo = index =>'));
  assert.ok(tourJs.includes("event.key === 'ArrowDown'"));
  assert.ok(tourJs.includes("prefers-reduced-motion: reduce"));
  assert.ok(!tourJs.includes('scrollMode'));
});

test('mobile navigation closes accessibly and restores focus on Escape', () => {
  assert.ok(js.includes('const closeMenu = (restoreFocus = false)'));
  assert.ok(js.includes("event.key === 'Escape'"));
  assert.ok(js.includes("menu.setAttribute('aria-expanded', 'false')"));
  assert.ok(js.includes("menu.focus()"));
  assert.ok(js.includes("setAttribute('aria-current', 'location')"));
});

test('the refined CRM tour and 3D scene remain responsive and reduced-motion aware', () => {
  const tourCss = fs.readFileSync('crm-product-tour.css', 'utf8');
  assert.ok(css.includes('.experience-scroll{height:360vh}'));
  assert.ok(css.includes('@media(max-width:700px){\n  .experience-scroll{height:270vh}'));
  assert.ok(tourCss.includes('.crm-tour{\n  height:420vh;'));
  assert.ok(tourCss.includes('.crm-tour{height:360vh}'));
  assert.ok(tourCss.includes('@media(prefers-reduced-motion:reduce)'));
  assert.ok(tourCss.includes('.crm-app-view.is-active{'));
});


test('CRM product spotlight tracks the frame pointer without per-event layout writes', () => {
  const tourJs = fs.readFileSync('crm-product-tour.js', 'utf8');
  assert.ok(tourJs.includes("appFrame.addEventListener('pointermove'"));
  assert.ok(tourJs.includes("appFrame.style.setProperty('--crm-pointer-x', pointerX)"));
  assert.ok(tourJs.includes("appFrame.addEventListener('pointerleave'"));
  assert.ok(tourJs.includes('if (pointerFrame) return'));
});
test('all browser interaction modules are included in the JavaScript syntax gate', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.ok(pkg.scripts['check:js'].includes('node --check main.js'));
  assert.ok(pkg.scripts['check:js'].includes('node --check product-showcase.js'));
  assert.ok(pkg.scripts['check:js'].includes('node --check crm-product-tour.js'));
  assert.ok(pkg.scripts['check:js'].includes('node --check motion-scene.mjs'));
});


test('Three.js CDN failure produces a static CRM presentation instead of a blank scene', () => {
  assert.ok(motion.includes('const THREE_MODULE_URL ='));
  assert.ok(motion.includes('THREE = await import(THREE_MODULE_URL)'));
  assert.ok(motion.includes("classList.add('motion-fallback')"));
  assert.ok(html.includes('motion-static-fallback'));
  assert.ok(css.includes('.motion-fallback .motion-static-fallback{display:block}'));
  assert.ok(html.includes('Структура программы остаётся доступна в следующих разделах'));
});

test('the hero scroll affordance continues into the cinematic scene', () => {
  assert.ok(html.includes('href="#experience" aria-label="Перейти к 3D-презентации системы"'));
  assert.ok(html.includes('id="experience"'));
});

test('all CRM tour controls have explicit relationships to their product screens', () => {
  for (let i = 0; i < 5; i++) {
    assert.ok(html.includes('data-crm-step="' + i + '" aria-controls="crm-view-' + i + '"'));
    assert.ok(html.includes('id="crm-view-' + i + '" data-crm-view="' + i + '"'));
  }
});

test('the closing action links to a real product section instead of an unavailable contact placeholder', () => {
  assert.ok(html.includes('<a class="closing-cta" href="#crm-tour">Посмотреть программу'));
  assert.ok(!html.includes('Контакты для демонстрации уточняются'));
});

test('mobile navigation exposes a control relationship and closes on outside interaction', () => {
  assert.ok(html.includes('id="primary-navigation"'));
  assert.ok(html.includes('aria-controls="primary-navigation"'));
  assert.ok(js.includes("menu.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню')"));
  assert.ok(js.includes("document.addEventListener('pointerdown'"));
});


test('CRM particle panel definitions are allocated once outside the frame initialization loop', () => {
  const loopAt = motion.indexOf('for (let i = 0; i < particleCount; i++)');
  const panelsAt = motion.indexOf('const screens = [');
  assert.ok(panelsAt >= 0 && loopAt > panelsAt);
});
