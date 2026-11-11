(() => {
  const scenes = [...document.querySelectorAll('[data-cinema-scene]')];
  if (!scenes.length) return;
  const number = document.querySelector('#cinema-scene-number');
  const label = document.querySelector('#cinema-scene-label');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  let active = null;
  let frame = 0;

  scenes.forEach(scene => {
    const atmosphere = document.createElement('div');
    atmosphere.className = 'cinema-atmosphere';
    atmosphere.setAttribute('aria-hidden', 'true');
    scene.prepend(atmosphere);
    scene.classList.add('cinema-scene-ready');
    scene.querySelectorAll('.module-card, .workflow-step').forEach((card, index) => {
      card.style.setProperty('--cinema-card-index', index);
    });
  });

  const setActive = scene => {
    if (!scene || scene === active) return;
    active?.classList.remove('is-cinema-active');
    active = scene;
    active.classList.add('is-cinema-active');
    if (number) number.textContent = scene.dataset.cinemaIndex || '—';
    if (label) label.textContent = scene.dataset.cinemaLabel || 'СКОЛ CRM';
  };

  const update = () => {
    const viewport = window.innerHeight || 1;
    let closest = null;
    let closestDistance = Infinity;
    scenes.forEach(scene => {
      const rect = scene.getBoundingClientRect();
      const progress = clamp((viewport - rect.top) / (viewport + rect.height));
      const distance = Math.abs((rect.top + rect.bottom) / 2 - viewport * .5);
      scene.style.setProperty('--cinema-progress', progress.toFixed(4));
      scene.style.setProperty('--cinema-x', (18 + progress * 64).toFixed(2) + '%');
      scene.style.setProperty('--cinema-y', (16 + (1 - progress) * 58).toFixed(2) + '%');
      scene.style.setProperty('--cinema-shift', ((.5 - progress) * 34).toFixed(2) + 'px');
      scene.style.setProperty('--cinema-angle', ((progress - .5) * 1.4).toFixed(2) + 'deg');
      scene.style.setProperty('--cinema-tilt', ((.5 - progress) * (finePointer ? 5.2 : 2.8)).toFixed(2) + 'deg');
      scene.style.setProperty('--cinema-frame-tilt', ((.5 - progress) * -1.15).toFixed(2) + 'deg');
      scene.style.setProperty('--cinema-dashboard-tilt', ((.5 - progress) * .94).toFixed(2) + 'deg');
      scene.style.setProperty('--cinema-scale', (1 + progress * .025).toFixed(4));
      scene.style.setProperty('--cinema-lift', ((.5 - progress) * 18).toFixed(2) + 'px');
      scene.style.setProperty('--cinema-title-shift', ((.5 - progress) * 13).toFixed(2) + 'px');
      scene.querySelectorAll('.module-card, .workflow-step').forEach(card => {
        const index = Number(card.style.getPropertyValue('--cinema-card-index') || 0);
        const stagger = (index - 1.5) * 2.4;
        card.style.setProperty('--cinema-card-lift', ((.5 - progress) * 15 + stagger).toFixed(2) + 'px');
        card.style.setProperty('--cinema-card-tilt', ((.5 - progress) * (index % 2 ? -2.2 : 2.2)).toFixed(2) + 'deg');
      });
      if (rect.top <= viewport * .58 && rect.bottom >= viewport * .42 && distance < closestDistance) {
        closest = scene;
        closestDistance = distance;
      }
    });
    if (closest) setActive(closest);
    frame = 0;
  };

  const requestUpdate = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(update);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      if (!visible.length) return;
      visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      setActive(visible[0].target);
    }, { threshold: [0.18, 0.38, 0.62], rootMargin: '-12% 0px -12% 0px' });
    scenes.forEach(scene => observer.observe(scene));
  }

  if (reducedMotion) {
    scenes.forEach(scene => scene.classList.add('cinema-reduced-motion'));
  } else {
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
  }
  setActive(scenes[0]);
  update();
})();