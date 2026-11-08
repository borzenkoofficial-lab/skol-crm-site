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
    document.querySelectorAll('[data-tilt]').forEach(card => {
      let frame = 0;
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          card.style.setProperty('--ry', ((x - .5) * 5.5).toFixed(2) + 'deg');
          card.style.setProperty('--rx', ((.5 - y) * 4.5).toFixed(2) + 'deg');
          frame = 0;
        });
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '50%');
      });
    });
  }

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

  // Global pointer field: one shared light source gives the interface spatial continuity.
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  const aura = document.querySelector('#pointer-aura');
  const cursor = document.querySelector('#cursor-reticle');
  let pointerFrame = 0;
  let pointerX = window.innerWidth * .5;
  let pointerY = window.innerHeight * .5;
  if (!reduceMotion && finePointer && aura) {
    document.documentElement.classList.add('has-pointer-field');
    window.addEventListener('pointermove', event => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--pointer-x', pointerX + 'px');
        document.documentElement.style.setProperty('--pointer-y', pointerY + 'px');
        if (cursor) {
          cursor.style.left = pointerX + 'px';
          cursor.style.top = pointerY + 'px';
        }
        pointerFrame = 0;
      });
    }, { passive: true });
    document.querySelectorAll('a,button,[data-tilt]').forEach(target => {
      target.addEventListener('pointerenter', () => cursor?.classList.add('is-hovering'));
      target.addEventListener('pointerleave', () => cursor?.classList.remove('is-hovering'));
    });
  }

  // Scroll velocity is used only as a visual accent; content layout never depends on it.
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  let scrollFrame = 0;
  window.addEventListener('scroll', () => {
    if (reduceMotion || scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      const current = window.scrollY;
      scrollVelocity = Math.max(-1, Math.min(1, (current - lastScrollY) / 42));
      document.documentElement.style.setProperty('--scroll-velocity', scrollVelocity.toFixed(2));
      document.documentElement.classList.toggle('is-scrolling-fast', Math.abs(scrollVelocity) > .55);
      lastScrollY = current;
      scrollFrame = 0;
    });
  }, { passive: true });

  // Bring each chapter into focus without adding a heavy continuous animation loop.
  if ('IntersectionObserver' in window) {
    const chapters = document.querySelectorAll('.feature, .modules, .workflow, .closing');
    const chapterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.chapter-in-view').forEach(node => node.classList.remove('chapter-in-view'));
        entry.target.classList.add('chapter-in-view');
      }
    }), { threshold: .28 });
    chapters.forEach(chapter => chapterObserver.observe(chapter));
  }

})();