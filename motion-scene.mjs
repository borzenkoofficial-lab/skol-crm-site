import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js';

(() => {
  const root = document.querySelector('#experience');
  const canvas = document.querySelector('#motion-canvas');
  if (!root || !canvas) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 700px)').matches;
  const copy = {
    kicker: document.querySelector('#motion-kicker'),
    title: document.querySelector('#motion-title'),
    description: document.querySelector('#motion-description'),
    index: document.querySelector('#motion-index'),
    progress: document.querySelector('#motion-progress')
  };
  const chapters = [
    { kicker: '01 / ВХОДЯЩИЙ ПОТОК', title: 'Информация<br><em>собирается.</em>', description: 'Запросы, документы и исходные данные перестают жить отдельно. Каждый элемент находит своё место.' },
    { kicker: '02 / ОБЪЕКТ В РАЗРЕЗЕ', title: 'Структура<br><em>становится видимой.</em>', description: 'Этапы, ресурсы, задачи и ответственность соединяются в единую модель строительного объекта.' },
    { kicker: '03 / ЭКОНОМИКА ОБЪЕКТА', title: 'Каждая цифра<br><em>имеет контекст.</em>', description: 'План, факт, расходы и поступления связаны с реальным ходом проекта.' },
    { kicker: '04 / ЕДИНЫЙ КОНТУР', title: 'Управление<br><em>без слепых зон.</em>', description: 'Объекты, команда и экономика сходятся в одном пространстве контроля.' }
  ];

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile, powerPreference: 'high-performance' });
  } catch {
    root.classList.add('motion-fallback');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.2 : 1.55));
  renderer.setSize(root.clientWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x090d09);
  scene.fog = new THREE.FogExp2(0x090d09, 0.022);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
  camera.position.set(-5, 4, 13);
  scene.add(new THREE.HemisphereLight(0xe5edda, 0x151b12, 1.25));
  const key = new THREE.DirectionalLight(0xf3f6e9, 2.25);
  key.position.set(-5, 10, 8);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x8cae65, 1.05);
  fill.position.set(7, 4, -7);
  scene.add(fill);
  const limeLight = new THREE.PointLight(0xc8f169, 34, 20, 2);
  limeLight.position.set(0, 4, 3);
  scene.add(limeLight);
  const backLight = new THREE.PointLight(0x829b62, 22, 18, 2);
  backLight.position.set(-5, 2, -7);
  scene.add(backLight);

  const makeMat = (color, metalness = 0.55, roughness = 0.3, opacity = 1, emissive = 0x000000, emissiveIntensity = 0) =>
    new THREE.MeshStandardMaterial({ color, metalness, roughness, transparent: opacity < 1, opacity, emissive, emissiveIntensity, depthWrite: opacity >= 0.98 });
  const mats = {
    steel: makeMat(0x75806e, 0.88, 0.26),
    steelDark: makeMat(0x30392d, 0.92, 0.22),
    concrete: makeMat(0x62695b, 0.28, 0.78),
    glass: makeMat(0x9ebc75, 0.42, 0.16, 0.3, 0x5f852d, 0.4),
    lime: makeMat(0xc8f169, 0.62, 0.18, 1, 0x8ebc42, 1.25),
    white: makeMat(0xe5ebdb, 0.38, 0.3, 0.88),
    darkGlass: makeMat(0x1b2817, 0.72, 0.16, 0.94, 0x283d1b, 0.35)
  };
  const box = (parent, size, pos, material, rot) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
    mesh.position.set(pos[0], pos[1], pos[2]);
    if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
    parent.add(mesh);
    return mesh;
  };
  const beam = (parent, a, b, radius, material) => {
    const start = new THREE.Vector3(a[0], a[1], a[2]);
    const end = new THREE.Vector3(b[0], b[1], b[2]);
    const delta = new THREE.Vector3().subVectors(end, start);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), 7), material);
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    parent.add(mesh);
    return mesh;
  };
  const tube = (parent, points, radius, material) => {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[1], p[2])));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, radius, 7, false), material);
    parent.add(mesh);
    return mesh;
  };
  const line = (parent, points, color = 0xc8f169, opacity = 0.55) => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p[0], p[1], p[2])));
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending });
    const mesh = new THREE.Line(geometry, material);
    parent.add(mesh);
    return mesh;
  };
  const makeLabelTexture = (title, meta, variant = 0) => {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 300;
    const ctx = c.getContext('2d');
    ctx.fillStyle = variant % 2 ? '#1b2417' : '#111810';
    ctx.fillRect(0, 0, 512, 300);
    ctx.strokeStyle = 'rgba(200,241,105,.65)';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, 480, 268);
    ctx.fillStyle = '#c8f169';
    ctx.font = '700 17px Arial';
    ctx.fillText('SKOL / CONTROL SYSTEM', 34, 52);
    ctx.fillStyle = '#eef2e7';
    ctx.font = '700 34px Arial';
    ctx.fillText(title, 34, 122);
    ctx.fillStyle = '#94a087';
    ctx.font = '16px Arial';
    ctx.fillText(meta, 34, 158);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i === variant % 5 ? '#c8f169' : '#3a4732';
      ctx.fillRect(34 + i * 87, 215, 62, 9);
      ctx.fillStyle = '#6d7961';
      ctx.fillRect(34 + i * 87, 235, 62, 2);
    }
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return texture;
  };
  const makeCard = (parent, title, meta, position, rotation, variant) => {
    // Keep the screen and its frame in one transform rig so their alignment survives float and scale motion.
    const rig = new THREE.Group();
    rig.position.set(position[0], position[1], position[2]);
    rig.rotation.set(rotation[0], rotation[1], rotation[2]);
    const material = new THREE.MeshBasicMaterial({ map: makeLabelTexture(title, meta, variant), transparent: true, side: THREE.DoubleSide, toneMapped: false });
    const card = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 0.96), material);
    rig.add(card);
    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.72, 1.03, 0.035)),
      new THREE.LineBasicMaterial({ color: 0xc8f169, transparent: true, opacity: 0.65 })
    );
    rig.add(frame);
    parent.add(rig);
    return rig;
  };

  const input = new THREE.Group();
  const building = new THREE.Group();
  const finance = new THREE.Group();
  const control = new THREE.Group();
  input.position.set(-5.2, 0.4, 0);
  finance.position.set(5.6, 0, 0);
  control.position.set(0, 0.7, -5.3);
  scene.add(input, building, finance, control);

  // Chapter 01: data fragments become a connected system.
  const inputTitles = [
    ['ЗАЯВКА', 'НОВЫЙ ЗАПРОС'], ['ОБЪЕКТ', 'КАРТОЧКА ПРОЕКТА'],
    ['СМЕТА', 'РАСЧЁТ РАБОТ'], ['КОМАНДА', 'НАЗНАЧЕНИЕ БРИГАДЫ'],
    ['ДОКУМЕНТ', 'АКТ / ДОГОВОР'], ['СРОКИ', 'КАЛЕНДАРЬ ЭТАПОВ']
  ];
  for (let i = 0; i < 6; i++) {
    const angle = i / 6 * Math.PI * 2;
    const radius = 2.5 + (i % 2) * 0.45;
    const pos = [Math.cos(angle) * radius, Math.sin(angle * 2) * 0.95, Math.sin(angle) * radius * 0.68];
    const card = makeCard(input, inputTitles[i][0], inputTitles[i][1], pos, [0, -angle * 0.18, Math.cos(angle) * 0.12], i);
    card.userData.phase = i * 0.9;
    card.userData.baseY = pos[1];
    line(input, [[0, 0, 0], pos], 0xa9d875, 0.18);
    const node = new THREE.Mesh(new THREE.IcosahedronGeometry(0.085, 1), mats.lime);
    node.position.set(pos[0], pos[1], pos[2]);
    input.add(node);
  }
  input.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 2), mats.darkGlass));
  const inputRing = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.014, 8, 120), new THREE.MeshBasicMaterial({ color: 0xc8f169, transparent: true, opacity: 0.65 }));
  inputRing.rotation.x = Math.PI / 2.5;
  input.add(inputRing);

  // Chapter 02: an architectural digital twin with a tower crane.
  box(building, [6.4, 0.28, 4.8], [0, -0.16, 0], mats.concrete);
  const floorY = [-0.02, 1.28, 2.56, 3.84, 5.12];
  const xs = [-2.75, -0.92, 0.92, 2.75];
  const zs = [-1.95, 0, 1.95];
  for (let level = 0; level < 5; level++) {
    const y = floorY[level];
    box(building, [6.05, 0.12, 4.45], [0, y, 0], level === 4 ? mats.glass : mats.steelDark);
    for (const x of xs) for (const z of zs) {
      box(building, [0.105, 1.28, 0.105], [x, y + 0.64, z], (x === -2.75 && z === -1.95) ? mats.lime : mats.steel);
    }
    for (const z of zs) beam(building, [-2.8, y + 1.24, z], [2.8, y + 1.24, z], 0.055, mats.steel);
    for (const x of xs) beam(building, [x, y + 1.24, -2.0], [x, y + 1.24, 2.0], 0.055, mats.steel);
  }
  // Glass curtain wall is isolated so it can unfold as its own cinematic beat.
  const facade = new THREE.Group();
  building.add(facade);
  const facadePanels = [];
  for (let level = 0; level < 4; level++) {
    const y = 0.65 + level * 1.28;
    for (let i = 0; i < 12; i++) {
      const panel = box(facade, [0.39, 0.94, 0.025], [-2.55 + i * 0.465, y, 2.225], mats.glass);
      panel.userData.baseX = panel.position.x;
      facadePanels.push(panel);
    }
    for (let i = 0; i < 8; i++) {
      const panel = box(facade, [0.025, 0.94, 0.43], [3.04, y, -1.75 + i * 0.5], mats.glass);
      panel.userData.baseZ = panel.position.z;
      facadePanels.push(panel);
    }
  }
  box(building, [0.82, 5.1, 0.82], [0.1, 2.48, -0.25], mats.concrete);
  for (let level = 0; level < 4; level++) box(building, [1.1, 0.035, 1.1], [0.1, 0.7 + level * 1.28, -0.25], mats.lime);
  const craneX = -4.05;
  for (let y = 0.1; y < 8; y += 0.55) {
    beam(building, [craneX, y, -0.2], [craneX, y + 0.55, -0.2], 0.035, mats.lime);
    beam(building, [craneX + 0.5, y, -0.2], [craneX + 0.5, y + 0.55, -0.2], 0.035, mats.steel);
    beam(building, [craneX, y, -0.2], [craneX + 0.5, y + 0.55, -0.2], 0.022, mats.steel);
    beam(building, [craneX + 0.5, y, -0.2], [craneX, y + 0.55, -0.2], 0.022, mats.steel);
  }
  beam(building, [craneX + 0.25, 8, -0.2], [craneX + 5.2, 8, -0.2], 0.065, mats.steel);
  beam(building, [craneX + 0.25, 8, -0.2], [craneX - 2.1, 8, -0.2], 0.07, mats.steelDark);
  beam(building, [craneX + 4.4, 8, -0.2], [craneX + 4.4, 5.6, -0.2], 0.018, mats.lime);
  box(building, [0.72, 0.55, 0.62], [craneX + 4.4, 5.25, -0.2], mats.lime);
  tube(building, [[-3.1, 0.05, 2.55], [-2.2, 1.2, 2.55], [-0.4, 2.2, 2.55], [1.5, 3.4, 2.55], [3.1, 5.1, 2.55]], 0.018, mats.lime);

  // Chapter 03: finance as a physical measuring instrument.
  box(finance, [6.7, 0.12, 4.4], [0, -1.45, 0], mats.steelDark);
  const heights = [0.9, 1.3, 1.05, 1.8, 1.55, 2.3, 1.95, 2.75, 2.45, 3.2, 2.9, 3.65];
  const financeBars = [];
  for (let i = 0; i < heights.length; i++) {
    const x = -2.75 + i * 0.5;
    const h = heights[i];
    const bar = box(finance, [0.27, h, 0.42], [x, -1.38 + h / 2, 0], i === heights.length - 1 ? mats.lime : mats.steel);
    bar.userData.baseHeight = h;
    financeBars.push(bar);
    const cap = box(finance, [0.29, 0.025, 0.46], [x, -1.36 + h, 0], mats.white);
    cap.userData.baseY = -1.36 + h;
    cap.userData.barIndex = i;
    financeBars.push(cap);
  }
  for (let i = 0; i < 5; i++) line(finance, [[-3.15, -1.37, -1.65 + i * 0.82], [3.15, -1.37, -1.65 + i * 0.82]], 0x91a47d, 0.2);
  tube(finance, [[-3, -0.4, 0.5], [-2, 0.1, 0.5], [-1, -0.05, 0.5], [0.1, 0.8, 0.5], [1.2, 0.55, 0.5], [2.8, 2.4, 0.5]], 0.027, mats.lime);
  const finRing = new THREE.Mesh(new THREE.TorusGeometry(3.45, 0.014, 8, 160), new THREE.MeshBasicMaterial({ color: 0xc8f169, transparent: true, opacity: 0.46 }));
  finRing.rotation.set(1.05, 0.2, 0.1);
  finRing.position.y = 0.8;
  finance.add(finRing);
  const finPulse = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 24), mats.lime);
  finPulse.position.set(2.8, 2.4, 0.5);
  finance.add(finPulse);

  // Chapter 04: one control core connects every system.
  const controlCore = new THREE.Mesh(new THREE.IcosahedronGeometry(1.18, 3), mats.darkGlass);
  control.add(controlCore);
  const coreWire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.42, 2)), new THREE.LineBasicMaterial({ color: 0xc8f169, transparent: true, opacity: 0.9 }));
  control.add(coreWire);
  const controlNodes = [];
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    const pos = [Math.cos(a) * 3.1, Math.sin(a * 2) * 1.2, Math.sin(a) * 2.7];
    const node = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 1), i % 3 === 0 ? mats.lime : mats.white);
    node.position.set(pos[0], pos[1], pos[2]);
    node.userData.baseY = pos[1];
    control.add(node);
    line(control, [[0, 0, 0], pos], 0xc8f169, 0.28);
    controlNodes.push(node);
  }
  makeCard(control, 'СКОЛ CRM', 'ОБЪЕКТЫ / КОМАНДА / ЭКОНОМИКА', [0, -2.5, 0], [0, 0, 0], 2).scale.setScalar(0.92);
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.1 + i * 0.52, i === 0 ? 0.022 : 0.009, 8, 180), new THREE.MeshBasicMaterial({ color: i === 0 ? 0xc8f169 : 0xa8bb8e, transparent: true, opacity: i === 0 ? 0.82 : 0.28 }));
    ring.rotation.set(0.45 + i * 0.31, i * 0.7, i * 0.2);
    control.add(ring);
  }

  // Transfer paths connect the financial instrument to the central control core.
  const transferGroup = new THREE.Group();
  scene.add(transferGroup);
  const transferCurves = [];
  const transferMeshes = [];
  const transferNodes = [];
  for (let i = 0; i < 3; i++) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(5.6 + (i - 1) * 0.85, 0.15 + i * 0.45, 0.1),
      new THREE.Vector3(3.9, 1.2 + i * 0.38, -1.4),
      new THREE.Vector3(2.1, 1.55 + i * 0.2, -3.1),
      new THREE.Vector3(0.55, 1.05 + i * 0.16, -4.65),
      new THREE.Vector3(0, 0.7 + i * 0.12, -5.3)
    ]);
    const geometry = new THREE.TubeGeometry(curve, 96, 0.018 - i * 0.003, 6, false);
    geometry.setDrawRange(0, 0);
    const material = new THREE.MeshBasicMaterial({ color: i === 1 ? 0xc8f169 : 0x9fb77b, transparent: true, opacity: i === 1 ? 0.88 : 0.48, blending: THREE.AdditiveBlending, depthWrite: false });
    const mesh = new THREE.Mesh(geometry, material);
    transferGroup.add(mesh);
    const node = new THREE.Mesh(new THREE.SphereGeometry(i === 1 ? 0.075 : 0.052, 12, 12), mats.lime);
    transferGroup.add(node);
    transferCurves.push(curve);
    transferMeshes.push(mesh);
    transferNodes.push(node);
  }

  // Atmospheric particles and an architectural floor grid.
  // Scroll-morphed particles: incoming data -> building structure -> project economics -> control core.
  const particleCount = mobile ? 420 : 900;
  const particleTargets = Array.from({ length: 4 }, () => new Float32Array(particleCount * 3));
  const financeHeights = [0.9, 1.3, 1.05, 1.8, 1.55, 2.3, 1.95, 2.75, 2.45, 3.2, 2.9, 3.65];
  for (let i = 0; i < particleCount; i++) {
    const angle = i * 2.399963;
    const radius = 0.8 + ((i * 37) % 100) / 100 * 2.2;
    particleTargets[0][i * 3] = -5.2 + Math.cos(angle) * radius;
    particleTargets[0][i * 3 + 1] = 0.4 + Math.sin(angle * 1.7) * 1.25;
    particleTargets[0][i * 3 + 2] = Math.sin(angle) * radius * 0.72;
    const face = i % 4, u = ((i * 17) % 101) / 100, v = ((i * 29) % 101) / 100;
    particleTargets[1][i * 3] = face < 2 ? (face === 0 ? -3.05 : 3.05) : -3.05 + u * 6.1;
    particleTargets[1][i * 3 + 1] = -0.05 + v * 5.25;
    particleTargets[1][i * 3 + 2] = face < 2 ? -2.15 + u * 4.3 : (face === 2 ? -2.15 : 2.15);
    const bar = i % financeHeights.length, level = (Math.floor(i / financeHeights.length) % 60) / 59;
    particleTargets[2][i * 3] = 5.6 - 2.75 + bar * 0.5;
    particleTargets[2][i * 3 + 1] = -1.38 + level * financeHeights[bar];
    particleTargets[2][i * 3 + 2] = ((i * 13) % 100) / 100 * 0.42 - 0.21;
    const sphereY = 1 - 2 * ((i * 37) % particleCount) / Math.max(1, particleCount - 1);
    const sphereRadius = 2.15 + ((i * 11) % 100) / 100 * 0.16;
    const sphereRing = Math.sqrt(Math.max(0, 1 - sphereY * sphereY));
    particleTargets[3][i * 3] = Math.cos(angle) * sphereRing * sphereRadius;
    particleTargets[3][i * 3 + 1] = 0.7 + sphereY * sphereRadius;
    particleTargets[3][i * 3 + 2] = -5.3 + Math.sin(angle) * sphereRing * sphereRadius;
  }
  const positions = new Float32Array(particleTargets[0]);
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1, 0), 18);
  const particleField = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0xc8f169, size: mobile ? 0.016 : 0.021, transparent: true, opacity: 0.34, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(particleField);
  const floor = new THREE.GridHelper(90, 90, 0x536546, 0x293326);
  floor.position.y = -1.62;
  floor.material.transparent = true;
  floor.material.opacity = 0.19;
  scene.add(floor);

  const groups = [input, building, finance, control];
  groups.forEach(group => group.traverse(obj => {
    if (!obj.material) return;
    obj.material = Array.isArray(obj.material) ? obj.material.map(material => material.clone()) : obj.material.clone();
  }));
  const materialsByGroup = groups.map(group => {
    const set = new Set();
    group.traverse(obj => {
      if (!obj.material) return;
      (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(material => set.add(material));
    });
    return [...set].map(material => ({ material, opacity: material.opacity }));
  });
  const setGroupOpacity = (index, opacity) => materialsByGroup[index].forEach(({ material, opacity: base }) => {
    material.transparent = opacity < 0.995 || base < 0.995;
    material.opacity = base * opacity;
    material.depthWrite = opacity > 0.92 && base > 0.95;
  });

  // Seven camera beats: establish the data field, inspect the structure, skim the facade,
  // move through the financial instrument, orbit the control core, then pull back to the whole system.
  // Eight deliberate shots: establish -> data push-in -> architectural reveal -> facade skim
  // -> finance close-up -> orbit the core -> release into a wide master shot.
  const cameraPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-8.2, 2.7, 8.2),
    new THREE.Vector3(-4.9, 1.75, 4.25),
    new THREE.Vector3(-1.9, 3.2, 6.1),
    new THREE.Vector3(3.55, 3.55, 3.65),
    new THREE.Vector3(8.1, 2.35, 4.5),
    new THREE.Vector3(4.0, 1.55, -3.2),
    new THREE.Vector3(-3.7, 1.95, -2.5),
    new THREE.Vector3(0.4, 3.0, 14.2)
  ], false, 'centripetal', 0.42);
  const targetPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5.2, 0.3, 0),
    new THREE.Vector3(-5.2, 0.5, 0),
    new THREE.Vector3(0, 2.1, 0),
    new THREE.Vector3(1.3, 3.0, 2.0),
    new THREE.Vector3(5.6, 0.9, 0),
    new THREE.Vector3(5.6, 0.65, 0),
    new THREE.Vector3(0, 0.7, -5.3),
    new THREE.Vector3(0, 0.5, 0)
  ], false, 'centripetal', 0.42);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = v => { const x = clamp(v, 0, 1); return x * x * (3 - 2 * x); };
  const mix = (a, b, t) => a + (b - a) * t;
  const opacityAt = (p, points) => {
    let i = 0;
    while (i < points.length - 2 && p > points[i + 1][0]) i++;
    const a = points[i], b = points[i + 1];
    return mix(a[1], b[1], smooth((p - a[0]) / (b[0] - a[0])));
  };
  const sampleTrack = (p, keys, column) => {
    let i = 0;
    while (i < keys.length - 2 && p > keys[i + 1][0]) i++;
    const a = keys[i], b = keys[i + 1];
    return mix(a[column], b[column], smooth((p - a[0]) / (b[0] - a[0])));
  };
  // p, focal length in degrees, roll, camera X/Y/Z offset, target X/Y/Z offset.
  // Short focal lengths create deliberate close-ups; the final wide lens restores spatial context.
  const shotTrack = [
    [0, 42, -0.004, 0, 0, 0, 0, 0, 0],
    [0.12, 27, 0.012, 0.12, -0.08, -0.12, 0.12, 0.04, 0],
    [0.29, 36, -0.008, -0.08, 0.1, 0.18, 0, 0.12, 0],
    [0.43, 25, 0.014, 0.1, -0.06, -0.16, 0.1, 0.08, 0.08],
    [0.58, 31, -0.012, -0.12, 0.04, 0.12, 0.08, 0, 0],
    [0.73, 24, 0.01, 0.08, -0.04, -0.1, 0, 0.04, 0],
    [0.88, 34, -0.006, -0.06, 0.08, 0.16, 0, 0.12, 0],
    [1, 43, 0, 0, 0, 0, 0, 0, 0]
  ];
  const visibility = [
    [[0, 1], [0.12, 1], [0.28, 0.04], [1, 0]],
    [[0, 0.04], [0.18, 0.4], [0.3, 1], [0.47, 0.5], [0.72, 0.1], [1, 0.24]],
    [[0, 0], [0.36, 0.03], [0.48, 1], [0.63, 0.42], [1, 0.08]],
    [[0, 0], [0.58, 0.03], [0.72, 1], [0.88, 0.82], [1, 0.72]]
  ];

  const state = { progress: 0 };
  let active = false, pageVisible = !document.hidden, contextLost = false;
  let raf = 0, pointerX = 0, pointerY = 0, targetPointerX = 0, targetPointerY = 0, lastFrameTime = 0, lastChapter = -1;
  const canAnimate = () => active && pageVisible && !contextLost && !reduced;
  const stopAnimation = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    lastFrameTime = 0;
  };
  const updateCopy = () => {
    const chapter = Math.min(3, Math.floor(state.progress * 4));
    if (chapter === lastChapter) return;
    lastChapter = chapter;
    const data = chapters[chapter];
    if (copy.kicker) copy.kicker.textContent = data.kicker;
    if (copy.title) copy.title.innerHTML = data.title;
    if (copy.description) copy.description.textContent = data.description;
    if (copy.index) copy.index.textContent = '0' + (chapter + 1);
    if (window.gsap && !reduced) {
      window.gsap.fromTo(copy.title, { y: 34, opacity: 0, filter: 'blur(12px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out', overwrite: true });
      window.gsap.fromTo(copy.description, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.08, ease: 'power2.out', overwrite: true });
    }
  };
  const render = () => {
    if (!active || !pageVisible || contextLost) return;
    const p = state.progress;
    const pos = cameraPath.getPointAt(p);
    const target = targetPath.getPointAt(p);
    const shot = column => sampleTrack(p, shotTrack, column);
    camera.position.set(
      pos.x + shot(3) + pointerX * (mobile ? 0.035 : 0.11),
      pos.y + shot(4) - pointerY * (mobile ? 0.025 : 0.075),
      pos.z + shot(5)
    );
    camera.lookAt(target.x + shot(6), target.y + shot(7), target.z + shot(8));
    // Shot roll and focal length are absolute scroll-driven values, never accumulated frame-to-frame.
    camera.rotation.z = shot(2);
    const nextFov = shot(1);
    if (Math.abs(camera.fov - nextFov) > 0.015) {
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    }
    groups.forEach((group, i) => setGroupOpacity(i, opacityAt(p, visibility[i])));
    input.rotation.y = -p * 1.5;
    input.rotation.z = Math.sin(p * Math.PI) * 0.08;
    input.scale.setScalar(mix(1, 0.82, smooth(p)));
    building.rotation.y = mix(-0.12, 0.1, p);
    building.position.y = Math.sin(p * Math.PI) * 0.12;
    // Structural frame rises from its foundation, then the facade unfolds from the center line.
    const frameBuild = smooth((p - 0.16) / 0.19);
    building.scale.y = mix(0.055, 1, frameBuild);
    const facadeOpen = smooth((p - 0.31) / 0.14);
    facade.scale.set(0.06 + facadeOpen * 0.94, 1, 0.08 + facadeOpen * 0.92);
    facadePanels.forEach(panel => {
      if (panel.userData.baseX !== undefined) panel.position.x = panel.userData.baseX * (0.08 + facadeOpen * 0.92);
      if (panel.userData.baseZ !== undefined) panel.position.z = panel.userData.baseZ * (0.08 + facadeOpen * 0.92);
    });
    finance.rotation.y = -0.12 + p * 0.28;
    // Finance columns rise from a common baseline, revealing the measuring instrument.
    const financeBuild = smooth((p - 0.445) / 0.13);
    financeBars.forEach(part => {
      if (part.userData.baseHeight !== undefined) {
        part.scale.y = Math.max(0.015, financeBuild);
        part.position.y = -1.38 + part.userData.baseHeight * part.scale.y / 2;
      } else if (part.userData.barIndex !== undefined) {
        const h = heights[part.userData.barIndex];
        part.position.y = -1.36 + h * financeBuild;
      }
    });
    // Draw the transfer paths progressively; light nodes travel along each path into the core.
    const transferProgress = smooth((p - 0.59) / 0.19);
    transferMeshes.forEach((mesh, i) => {
      const geometry = mesh.geometry;
      const total = geometry.index ? geometry.index.count : geometry.attributes.position.count;
      geometry.setDrawRange(0, Math.floor(total * transferProgress));
      transferNodes[i].position.copy(transferCurves[i].getPointAt((p * 2.8 + i * 0.21) % 1));
      transferNodes[i].visible = transferProgress > 0.04 && p < 0.91;
      mesh.material.opacity = (i === 1 ? 0.88 : 0.48) * transferProgress;
    });
    control.rotation.y = p * 0.46;
    control.rotation.x = Math.sin(p * Math.PI) * 0.08;
    controlCore.rotation.y = p * 1.5;
    controlCore.rotation.x = p * 0.6;
    coreWire.rotation.copy(controlCore.rotation);
    controlNodes.forEach((node, i) => { node.position.y = node.userData.baseY + Math.sin(performance.now() * 0.001 + i) * 0.14; });
    const morphPosition = p * 3;
    const morphSegment = Math.min(2, Math.floor(morphPosition));
    const morphMix = smooth(morphPosition - morphSegment);
    const morphFrom = particleTargets[morphSegment], morphTo = particleTargets[morphSegment + 1];
    for (let i = 0; i < positions.length; i++) positions[i] = mix(morphFrom[i], morphTo[i], morphMix);
    particleGeometry.attributes.position.needsUpdate = true;
    particleField.rotation.y = p * 0.035;
    particleField.rotation.x = Math.sin(p * Math.PI) * 0.012;
    limeLight.intensity = 26 + Math.sin(p * Math.PI * 4) * 8;
    limeLight.position.x = mix(-5, 5, p);
    if (copy.progress) copy.progress.style.transform = 'scaleX(' + p + ')';
    renderer.render(scene, camera);
  };
  const resize = () => {
    if (contextLost) return;
    const width = Math.max(1, root.clientWidth);
    const height = Math.max(1, window.innerHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    render();
  };
  root.addEventListener('pointermove', event => {
    if (reduced || mobile) return;
    const rect = root.getBoundingClientRect();
    targetPointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    targetPointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  }, { passive: true });
  root.addEventListener('pointerleave', () => { targetPointerX = 0; targetPointerY = 0; });
  const animate = () => {
    if (!canAnimate()) { stopAnimation(); return; }
    raf = requestAnimationFrame(animate);
    const now = performance.now();
    const delta = lastFrameTime ? Math.min((now - lastFrameTime) / 1000, 0.05) : 1 / 60;
    lastFrameTime = now;
    const pointerEase = 1 - Math.exp(-delta * 5.5);
    pointerX += (targetPointerX - pointerX) * pointerEase;
    pointerY += (targetPointerY - pointerY) * pointerEase;
    const frameScale = delta * 60;
    const time = now * 0.00045;
    input.children.forEach(child => {
      if (child.userData.phase !== undefined) child.position.y = child.userData.baseY + Math.sin(time * 3 + child.userData.phase) * 0.075;
    });
    control.children.forEach((child, i) => {
      if (child.geometry && child.geometry.type === 'TorusGeometry') child.rotation.z += (i % 2 ? -1 : 1) * 0.00045 * frameScale;
    });
    render();
  };

  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    const timeline = window.gsap.timeline({
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 1.05, invalidateOnRefresh: true, onUpdate: updateCopy }
    });
    timeline.to(state, { progress: 1, duration: 1, ease: 'none', onUpdate: () => { updateCopy(); render(); } });
  } else {
    window.addEventListener('scroll', () => {
      const rect = root.getBoundingClientRect();
      const range = Math.max(1, root.offsetHeight - window.innerHeight);
      state.progress = clamp(-rect.top / range, 0, 1);
      updateCopy();
      render();
    }, { passive: true });
  }
  const observer = new IntersectionObserver(entries => {
    active = entries.some(entry => entry.isIntersecting);
    if (canAnimate() && !raf) animate();
    if (!active) stopAnimation();
    if (active && reduced) render();
  }, { threshold: 0.01 });
  observer.observe(root);
  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
    if (canAnimate() && !raf) animate();
    else if (!pageVisible) stopAnimation();
    if (pageVisible && active) render();
  });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    stopAnimation();
    root.classList.add('motion-fallback');
  });
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    root.classList.remove('motion-fallback');
    resize();
    render();
    if (canAnimate() && !raf) animate();
  });
  window.addEventListener('resize', resize, { passive: true });
  if (reduced) { root.classList.add('motion-reduced'); state.progress = 0.31; }
  updateCopy();
  resize();
  active = true;
  render();
  if (canAnimate()) animate();
})();
