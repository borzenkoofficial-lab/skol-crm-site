(() => {
  const root = document.querySelector('#crm-tour');
  if (!root) return;
  const steps = [...root.querySelectorAll('[data-crm-step]')];
  const views = [...root.querySelectorAll('[data-crm-view]')];
  const progress = root.querySelector('#crm-tour-progress');
  const caption = root.querySelector('#crm-tour-caption');
  const sectionLabel = root.querySelector('#crm-app-section');
  const dockItems = [...root.querySelectorAll('.crm-app-dock span')];
  const appFrame = root.querySelector('.crm-app-frame');
  const dockIndexByStep = [0, 1, 2, 3, 8];
  const labels = ['Обзор бизнеса', 'Заявки', 'Объекты', 'ПИ · Расчёт объекта', 'Центр привлечения заказов'];
  let active = -1;
  let frame = 0;
  const setActive = (index, fromScroll = false) => {
    const next = Math.max(0, Math.min(steps.length - 1, index));
    if (next === active) return;
    active = next;
    steps.forEach((step, i) => {
      const selected = i === next;
      step.classList.toggle('is-active', selected);
      if (selected) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    views.forEach((view, i) => {
      const selected = i === next;
      view.classList.toggle('is-active', selected);
      view.setAttribute('aria-hidden', String(!selected));
      view.inert = !selected;
    });
    if (progress) progress.style.width = ((next + 1) / steps.length * 100) + '%';
    if (caption) caption.textContent = String(next + 1).padStart(2, '0') + ' / ' + labels[next].toUpperCase();
    if (sectionLabel) sectionLabel.textContent = labels[next];
    dockItems.forEach((item, i) => item.classList.toggle('is-active', i === dockIndexByStep[next]));
  };
  const updateFromScroll = () => {
    frame = 0;
    const rect = root.getBoundingClientRect();
    const range = Math.max(1, rect.height - window.innerHeight);
    const travelled = Math.min(range, Math.max(0, -rect.top));
    setActive(Math.min(steps.length - 1, Math.floor(travelled / range * steps.length)));
  };
  const requestUpdate = () => {
    if (frame) return;
    frame = requestAnimationFrame(updateFromScroll);
  };

  // A restrained pointer light follows the user's focus across the CRM application frame.
  if (appFrame && window.matchMedia('(pointer:fine)').matches) {
    let pointerFrame = 0;
    let pointerX = '50%';
    let pointerY = '38%';
    appFrame.addEventListener('pointermove', event => {
      const rect = appFrame.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerX = (Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) * 100).toFixed(1) + '%';
      pointerY = (Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) * 100).toFixed(1) + '%';
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        appFrame.style.setProperty('--crm-pointer-x', pointerX);
        appFrame.style.setProperty('--crm-pointer-y', pointerY);
        pointerFrame = 0;
      });
    }, { passive: true });
    appFrame.addEventListener('pointerleave', () => {
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      appFrame.style.setProperty('--crm-pointer-x', '50%');
      appFrame.style.setProperty('--crm-pointer-y', '38%');
    });
  }
  const goTo = index => {
    const rect = root.getBoundingClientRect();
    const range = Math.max(1, rect.height - window.innerHeight);
    const targetY = window.scrollY + rect.top + range * (index / steps.length);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: targetY, behavior: reducedMotion ? 'auto' : 'smooth' });
  };
  steps.forEach((step, index) => {
    step.addEventListener('click', () => goTo(index));
    step.addEventListener('keydown', event => {
      if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? steps.length - 1 :
        Math.max(0, Math.min(steps.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)));
      steps[next].focus();
      goTo(next);
    });
  });
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  setActive(0);
  requestUpdate();
})();