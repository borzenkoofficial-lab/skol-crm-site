(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = document.querySelector('#scroll-progress');
  const workflowProgress = document.querySelector('#workflow-progress');
  const revealEls = document.querySelectorAll('.reveal');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (menu && nav) menu.addEventListener('click', () => {
    nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(nav.classList.contains('open')));
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealEls.forEach(el => observer.observe(el));
  } else revealEls.forEach(el => el.classList.add('is-visible'));

  let ticking = false;
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.width = (value * 100) + '%';
    if (workflowProgress) {
      const section = document.querySelector('.workflow-track');
      const rect = section?.getBoundingClientRect();
      if (rect) {
        const amount = Math.min(1, Math.max(0, (window.innerHeight * .82 - rect.top) / (rect.height + window.innerHeight * .25)));
        workflowProgress.style.width = (amount * 100) + '%';
      }
    }
    if (!reduceMotion && window.innerWidth > 700) {
      document.querySelectorAll('.parallax').forEach(el => {
        const rect = el.getBoundingClientRect();
        const speed = Number(el.dataset.speed || 0);
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
        el.style.translate = '0 ' + (-offset).toFixed(1) + 'px';
      });
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('pointermove', event => {
        const r = el.getBoundingClientRect();
        const x = (event.clientX - r.left - r.width / 2) * .12;
        const y = (event.clientY - r.top - r.height / 2) * .12;
        el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }
})();