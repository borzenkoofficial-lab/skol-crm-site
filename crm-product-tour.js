(() => {
  const root = document.querySelector('#crm-tour');
  if (!root) return;
  const steps = [...root.querySelectorAll('[data-crm-step]')];
  const views = [...root.querySelectorAll('[data-crm-view]')];
  const progress = root.querySelector('#crm-tour-progress');
  const caption = root.querySelector('#crm-tour-caption');
  const sectionLabel = root.querySelector('#crm-app-section');
  const labels = ['Обзор бизнеса', 'Заявки', 'Объекты', 'ПИ · Расчёт объекта', 'Центр привлечения заказов'];
  let active = -1;
  let frame = 0;
  let scrollMode = true;
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
    });
    if (progress) progress.style.width = ((next + 1) / steps.length * 100) + '%';
    if (caption) caption.textContent = String(next + 1).padStart(2, '0') + ' / ' + labels[next].toUpperCase();
    if (sectionLabel) sectionLabel.textContent = labels[next];
  };
  const updateFromScroll = () => {
    frame = 0;
    if (!scrollMode) return;
    const rect = root.getBoundingClientRect();
    const range = Math.max(1, rect.height - window.innerHeight);
    const travelled = Math.min(range, Math.max(0, -rect.top));
    setActive(Math.min(steps.length - 1, Math.floor(travelled / range * steps.length)));
  };
  const requestUpdate = () => {
    if (frame) return;
    frame = requestAnimationFrame(updateFromScroll);
  };
  steps.forEach((step, index) => {
    step.addEventListener('click', () => {
      const rect = root.getBoundingClientRect();
      const range = Math.max(1, rect.height - window.innerHeight);
      const targetY = window.scrollY + rect.top + range * (index / steps.length);
      window.scrollTo({ top: targetY, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    step.addEventListener('keydown', event => {
      if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? steps.length - 1 :
        Math.max(0, Math.min(steps.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)));
      steps[next].focus();
      steps[next].click();
    });
  });
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  setActive(0);
  requestUpdate();
})();