import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js';

(() => {
  const section = document.querySelector('#experience');
  const canvas = document.querySelector('#motion-canvas');
  if (!section || !canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 700px)').matches;
  const copy = {
    kicker: document.querySelector('#motion-kicker'),
    title: document.querySelector('#motion-title'),
    description: document.querySelector('#motion-description'),
    index: document.querySelector('#motion-index'),
    progress: document.querySelector('#motion-progress')
  };
  const scenes = [
    {
      kicker: '01 / ВХОДЯЩИЕ ДАННЫЕ',
      title: 'Из потока<br><em>в систему.</em>',
      description: 'Заявки, документы и расчёты сходятся в одном пространстве. Ничего не теряется между сообщениями и таблицами.'
    },
    {
      kicker: '02 / СТРУКТУРА ОБЪЕКТА',
      title: 'Каждый элемент<br><em>на своём месте.</em>',
      description: 'Объект собирается из этапов, задач, сроков и ответственных. Связи становятся видимыми.'
    },
    {
      kicker: '03 / ЭКОНОМИКА РАБОТ',
      title: 'Деньги под<br><em>точным контролем.</em>',
      description: 'План, факт, поступления и расходы связаны с реальным ходом работ.'
    },
    {
      kicker: '04 / ЕДИНЫЙ КОНТРОЛЬ',
      title: 'Вся работа.<br><em>Одна система.</em>',
      description: 'Данные, команда и экономика объединяются в управляемую структуру СКОЛ.'
    }
  ];

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !mobile,
      powerPreference: 'high-performance'
    });
  } catch (error) {
    section.classList.add('motion-fallback');
    return;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0c100b, 0.035);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(6.4, 4.4, 11.5);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.65));
  renderer.setSize(section.clientWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;

  scene.add(new THREE.HemisphereLight(0xdfe9ce, 0x11150e, 1.35));
  const keyLight = new THREE.DirectionalLight(0xf0f4df, 2.1);
  keyLight.position.set(-4, 8, 7);
  scene.add(keyLight);
  const limeLight = new THREE.PointLight(0xc8f169, 28, 16, 2);
  limeLight.position.set(2.5, 2.2, 1.5);
  scene.add(limeLight);
  const rimLight = new THREE.PointLight(0x8cae62, 20, 18, 2);
  rimLight.position.set(-5, -1, -3);
  scene.add(rimLight);

  const world = new THREE.Group();
  world.position.set(1.45, 0.05, 0);
  scene.add(world);

  const makeMaterial = (color, opacity, metalness, roughness, emissive, emissiveIntensity) =>
    new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity,
      metalness: metalness === undefined ? 0.68 : metalness,
      roughness: roughness === undefined ? 0.3 : roughness,
      emissive: emissive || 0x000000,
      emissiveIntensity: emissiveIntensity || 0,
      depthWrite: opacity >= 0.98
    });

  const addBox = (parent, size, position, material, rotation) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
    mesh.position.set(position[0], position[1], position[2]);
    if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    parent.add(mesh);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry),
      new THREE.LineBasicMaterial({ color: 0xc8f169, transparent: true, opacity: 0.28 })
    );
    edges.position.copy(mesh.position);
    edges.rotation.copy(mesh.rotation);
    parent.add(edges);
    return mesh;
  };

  const addLine = (parent, points, color, opacity, radius) => {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(point[0], point[1], point[2])));
    const geometry = radius
      ? new THREE.TubeGeometry(curve, 72, radius, 6, false)
      : new THREE.BufferGeometry().setFromPoints(curve.getPoints(72));
    const material = radius
      ? new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })
      : new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending });
    const line = radius ? new THREE.Mesh(geometry, material) : new THREE.Line(geometry, material);
    parent.add(line);
    return line;
  };

  const inputGroup = new THREE.Group();
  const structureGroup = new THREE.Group();
  const financeGroup = new THREE.Group();
  const controlGroup = new THREE.Group();
  world.add(inputGroup, structureGroup, financeGroup, controlGroup);

  const metal = makeMaterial(0x89927d, 0.82, 0.82, 0.25);
  const glass = makeMaterial(0x8caa62, 0.22, 0.4, 0.18, 0x6d9c34, 0.5);
  const darkMetal = makeMaterial(0x303a2a, 0.96, 0.9, 0.22);
  const lime = makeMaterial(0xc8f169, 0.96, 0.58, 0.18, 0x8fbf3c, 1.5);
  const pale = makeMaterial(0xe0e8d5, 0.8, 0.48, 0.28, 0x8da86c, 0.3);

  // Raw information: loose panels orbiting before they lock into the system.
  for (let i = 0; i < 17; i++) {
    const angle = (i / 17) * Math.PI * 2;
    const radius = 2.8 + (i % 4) * 0.34;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius * 0.78;
    const y = ((i % 5) - 2) * 0.48;
    const panel = addBox(inputGroup, [0.72 + (i % 3) * 0.18, 0.055, 0.5], [x, y, z], i % 4 === 0 ? lime : glass, [0, -angle * 0.24, (i % 3 - 1) * 0.08]);
    panel.userData.phase = i * 0.7;
    addLine(inputGroup, [[x, y, z], [x * 0.42, y * 0.3, z * 0.42], [0, 0, 0]], 0xb9dc83, 0.23, 0.009);
  }

  // The object structure: a precise, modular construction skeleton.
  for (let level = 0; level < 4; level++) {
    const y = -1.45 + level * 0.92;
    addBox(structureGroup, [4.2, 0.105, 3.2], [0, y, 0], level === 3 ? glass : darkMetal);
    for (let corner = 0; corner < 4; corner++) {
      const x = corner % 2 === 0 ? -1.98 : 1.98;
      const z = corner < 2 ? -1.48 : 1.48;
      addBox(structureGroup, [0.105, 0.92, 0.105], [x, y + 0.46, z], corner === 0 ? lime : metal);
    }
    addLine(structureGroup, [[-2.05, y + 0.08, -1.56], [2.05, y + 0.08, -1.56], [2.05, y + 0.08, 1.56], [-2.05, y + 0.08, 1.56], [-2.05, y + 0.08, -1.56]], 0xc8f169, 0.62, 0.012);
  }
  for (let i = 0; i < 9; i++) {
    const x = -1.7 + i * 0.42;
    addBox(structureGroup, [0.025, 2.8, 0.025], [x, -0.08, -1.55], glass);
  }
  addBox(structureGroup, [1.35, 1.35, 1.35], [0, 0.02, 0], makeMaterial(0x25301f, 0.95, 0.72, 0.2, 0x587b2c, 0.7));
  addLine(structureGroup, [[-2.7, -1.6, 0], [-2.7, 1.7, 0], [2.7, 1.7, 0], [2.7, -1.6, 0]], 0xc8f169, 0.72, 0.014);

  // Project economics: a sculptural chart with a moving light trace.
  const barHeights = [0.7, 1.05, 0.92, 1.55, 1.3, 1.95, 1.62, 2.25, 2.05, 2.65];
  for (let i = 0; i < barHeights.length; i++) {
    const x = -2.15 + i * 0.48;
    const h = barHeights[i];
    addBox(financeGroup, [0.22, h, 0.34], [x, -1.55 + h / 2, 0], i === barHeights.length - 1 ? lime : metal);
    addLine(financeGroup, [[x, -1.55, -0.3], [x, -1.55, 0.3]], 0xc8f169, 0.48, 0.008);
  }
  const financeRing = new THREE.Mesh(new THREE.TorusGeometry(2.65, 0.012, 8, 140), new THREE.MeshBasicMaterial({ color: 0xc8f169, transparent: true, opacity: 0.55 }));
  financeRing.rotation.x = Math.PI / 2.8;
  financeRing.position.y = 0.2;
  financeGroup.add(financeRing);
  const financeRing2 = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.008, 8, 140), new THREE.MeshBasicMaterial({ color: 0xdce8c9, transparent: true, opacity: 0.2 }));
  financeRing2.rotation.set(1.2, 0.3, 0.2);
  financeGroup.add(financeRing2);
  addLine(financeGroup, [[-2.4, -1.5, 0.4], [-1.2, -0.3, 0.4], [0.2, 0.15, 0.4], [1.1, 0.8, 0.4], [2.25, 1.3, 0.4]], 0xc8f169, 0.92, 0.025);

  // One control core: all layers converge around a single point.
  const core = addBox(controlGroup, [2.05, 2.05, 2.05], [0, 0, 0], makeMaterial(0x6d8550, 0.18, 0.42, 0.12, 0x9ccf4e, 1.2));
  const coreEdges = new THREE.LineSegments(new THREE.EdgesGeometry(core.geometry), new THREE.LineBasicMaterial({ color: 0xc8f169, transparent: true, opacity: 0.95 }));
  coreEdges.position.copy(core.position);
  controlGroup.add(coreEdges);
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.15 + i * 0.52, i === 0 ? 0.018 : 0.009, 8, 160),
      new THREE.MeshBasicMaterial({ color: i === 0 ? 0xc8f169 : 0xb8c7a2, transparent: true, opacity: i === 0 ? 0.76 : 0.26, blending: THREE.AdditiveBlending })
    );
    ring.rotation.set(0.55 + i * 0.32, i * 0.75, 0.35 * i);
    controlGroup.add(ring);
  }
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4;
    const node = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 1), lime);
    node.position.set(Math.cos(angle) * 2.5, Math.sin(angle * 2) * 0.85, Math.sin(angle) * 2.5);
    controlGroup.add(node);
    addLine(controlGroup, [[0, 0, 0], [node.position.x, node.position.y, node.position.z]], 0xc8f169, 0.28, 0.008);
  }

  // A continuous luminous path connects the four chapters.
  const trail = addLine(world, [[-4, -0.9, -2.8], [-2.6, 1.4, -1.7], [-0.8, -0.4, 1.9], [1.4, 1.6, 1.1], [3.7, -0.6, -1.2], [4.5, 1.2, 1.6]], 0xc8f169, 0.7, 0.018);

  // Atmospheric particle field with deterministic placement.
  const particleCount = mobile ? 360 : 760;
  const particlePositions = new Float32Array(particleCount * 3);
  const particlePhases = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    const a = i * 2.399963;
    const r = 2.2 + ((i * 17) % 100) / 100 * 6.4;
    particlePositions[i * 3] = Math.cos(a) * r;
    particlePositions[i * 3 + 1] = (((i * 13) % 100) / 100 - 0.5) * 6;
    particlePositions[i * 3 + 2] = Math.sin(a) * r;
    particlePhases[i] = (i % 31) / 31;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({ color: 0xc8f169, size: mobile ? 0.022 : 0.028, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true })
  );
  scene.add(particles);

  // Architectural floor grid and distant reference rings.
  const grid = new THREE.GridHelper(30, 60, 0x61724d, 0x2d3926);
  grid.position.y = -2.2;
  grid.material.transparent = true;
  grid.material.opacity = 0.2;
  scene.add(grid);
  const horizon = new THREE.Mesh(
    new THREE.TorusGeometry(9, 0.008, 4, 180),
    new THREE.MeshBasicMaterial({ color: 0x91a77b, transparent: true, opacity: 0.2 })
  );
  horizon.rotation.x = Math.PI / 2;
  horizon.position.y = -2.15;
  scene.add(horizon);

  const groupFrames = [
    { p: 0, input: 1, structure: 0.08, finance: 0, control: 0.02 },
    { p: 0.25, input: 0.2, structure: 1, finance: 0.05, control: 0.04 },
    { p: 0.5, input: 0.02, structure: 0.36, finance: 1, control: 0.08 },
    { p: 0.75, input: 0, structure: 0.24, finance: 0.22, control: 1 },
    { p: 1, input: 0, structure: 0.35, finance: 0.12, control: 0.92 }
  ];
  const cameraFrames = [
    { p: 0, pos: [6.5, 4.2, 11.6], target: [0.4, 0.05, 0] },
    { p: 0.25, pos: [5.1, 2.6, 8.3], target: [0.3, 0.05, 0] },
    { p: 0.5, pos: [-4.8, 3.4, 8.6], target: [0, 0.05, 0] },
    { p: 0.75, pos: [1.4, 6.5, 8.4], target: [0, 0, 0] },
    { p: 1, pos: [0.8, 2.4, 10.5], target: [0, 0, 0] }
  ];

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smooth = value => {
    const v = clamp(value, 0, 1);
    return v * v * (3 - 2 * v);
  };
  const mix = (a, b, t) => a + (b - a) * t;
  const sampleFrames = (frames, p, key) => {
    let index = 0;
    while (index < frames.length - 2 && p > frames[index + 1].p) index++;
    const a = frames[index];
    const b = frames[index + 1];
    const t = smooth((p - a.p) / (b.p - a.p));
    return a[key].map((value, i) => mix(value, b[key][i], t));
  };
  const sampleOpacity = (key, p) => {
    let index = 0;
    while (index < groupFrames.length - 2 && p > groupFrames[index + 1].p) index++;
    const a = groupFrames[index];
    const b = groupFrames[index + 1];
    return mix(a[key], b[key], smooth((p - a.p) / (b.p - a.p)));
  };
  const setOpacity = (group, opacity) => {
    group.traverse(object => {
      if (!object.material) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach(material => {
        if (material.userData.baseOpacity === undefined) material.userData.baseOpacity = material.opacity;
        material.opacity = material.userData.baseOpacity * opacity;
        material.transparent = true;
      });
    });
  };

  const state = { progress: reduceMotion ? 0.28 : 0 };
  let active = true;
  let pointerX = 0;
  let pointerY = 0;
  let frame = 0;
  let lastChapter = -1;

  const updateCopy = () => {
    const scaled = state.progress * 3;
    const chapter = Math.min(3, Math.floor(scaled + 0.00001));
    if (chapter === lastChapter) return;
    lastChapter = chapter;
    const item = scenes[chapter];
    if (copy.kicker) copy.kicker.textContent = item.kicker;
    if (copy.title) copy.title.innerHTML = item.title;
    if (copy.description) copy.description.textContent = item.description;
    if (copy.index) copy.index.textContent = '0' + (chapter + 1);
    if (copy.title && window.gsap && !reduceMotion) {
      window.gsap.fromTo(copy.title, { y: 28, opacity: 0.2, filter: 'blur(8px)' }, {
        y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.75, ease: 'power3.out', overwrite: true
      });
      window.gsap.fromTo(copy.description, { y: 16, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.65, delay: 0.08, ease: 'power2.out', overwrite: true
      });
    }
  };

  const render = () => {
    if (!active) return;
    const p = state.progress;
    const camPos = sampleFrames(cameraFrames, p, 'pos');
    const camTarget = sampleFrames(cameraFrames, p, 'target');
    camera.position.set(
      camPos[0] + pointerX * (mobile ? 0.08 : 0.22),
      camPos[1] - pointerY * (mobile ? 0.05 : 0.14),
      camPos[2]
    );
    camera.lookAt(camTarget[0], camTarget[1], camTarget[2]);

    setOpacity(inputGroup, sampleOpacity('input', p));
    setOpacity(structureGroup, sampleOpacity('structure', p));
    setOpacity(financeGroup, sampleOpacity('finance', p));
    setOpacity(controlGroup, sampleOpacity('control', p));

    world.rotation.y = mix(-0.16, 0.38, p);
    world.rotation.x = Math.sin(p * Math.PI * 2) * 0.035;
    inputGroup.rotation.y = -p * 1.2;
    structureGroup.rotation.y = mix(-0.12, 0.16, p);
    financeGroup.rotation.y = -0.22 + p * 0.45;
    controlGroup.rotation.y = p * 0.62;
    controlGroup.rotation.x = Math.sin(p * Math.PI) * 0.12;
    trail.material.dashOffset = -p * 6;
    particles.rotation.y = p * 0.18;
    particles.rotation.x = Math.sin(p * Math.PI) * 0.04;
    limeLight.intensity = 22 + Math.sin(p * Math.PI * 3) * 5;
    if (copy.progress) copy.progress.style.transform = 'scaleX(' + p + ')';

    renderer.render(scene, camera);
  };

  const resize = () => {
    const width = Math.max(1, section.clientWidth);
    const height = Math.max(1, window.innerHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    render();
  };

  const onPointer = event => {
    const rect = section.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  };
  section.addEventListener('pointermove', onPointer, { passive: true });
  section.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });

  const animate = () => {
    if (!active) return;
    frame = requestAnimationFrame(animate);
    if (!reduceMotion) {
      const time = performance.now() * 0.00018;
      inputGroup.children.forEach(child => {
        if (child.userData.phase !== undefined) {
          child.position.y += Math.sin(time * 3 + child.userData.phase) * 0.0008;
        }
      });
      controlGroup.children.forEach((child, index) => {
        if (child.geometry && child.geometry.type === 'TorusGeometry') child.rotation.z += 0.0005 * (index % 2 ? -1 : 1);
      });
    }
    render();
  };

  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    const timeline = window.gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.15,
        invalidateOnRefresh: true,
        onUpdate: () => {
          updateCopy();
        }
      }
    });
    timeline.to(state, { progress: 1, duration: 1, ease: 'none', onUpdate: () => {
      updateCopy();
      render();
    } });
  } else {
    window.addEventListener('scroll', () => {
      const rect = section.getBoundingClientRect();
      const range = Math.max(1, section.offsetHeight - window.innerHeight);
      state.progress = clamp(-rect.top / range, 0, 1);
      updateCopy();
      render();
    }, { passive: true });
  }

  const observer = new IntersectionObserver(entries => {
    active = entries.some(entry => entry.isIntersecting);
    if (active && !frame) animate();
    if (!active && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }, { threshold: 0.01 });
  observer.observe(section);

  window.addEventListener('resize', resize, { passive: true });
  if (reduceMotion) {
    section.classList.add('motion-reduced');
    state.progress = 0.28;
  }
  updateCopy();
  resize();
  animate();
})();
