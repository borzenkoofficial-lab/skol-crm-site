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


  const film = document.querySelector('.scroll-film');
  const filmCanvas = document.querySelector('#film-canvas');
  if (film && filmCanvas) {
    const ctx = filmCanvas.getContext('2d', { alpha: false });
    const title = document.querySelector('#film-title');
    const kicker = document.querySelector('#film-kicker');
    const description = document.querySelector('#film-description');
    const count = document.querySelector('#film-count');
    const filmProgress = document.querySelector('#film-progress');
    const scenes = [
      { kicker: '01 — ВХОДЯЩИЕ ДАННЫЕ', title: 'Сложность<br><em>становится ясностью.</em>', description: 'Запросы, документы и расчёты собираются в единую рабочую картину.' },
      { kicker: '02 — СТРУКТУРА ОБЪЕКТА', title: 'Каждая задача<br><em>на своём месте.</em>', description: 'Объекты, этапы, сроки и ответственные связаны между собой.' },
      { kicker: '03 — ЭКОНОМИКА РАБОТ', title: 'Цифры обретают<br><em>контекст.</em>', description: 'Плановые и фактические показатели помогают видеть экономику проекта.' },
      { kicker: '04 — ЕДИНЫЙ КОНТРОЛЬ', title: 'Вы управляете<br><em>целой системой.</em>', description: 'Рабочий процесс становится прозрачным — от запроса до закрытия объекта.' }
    ];
    let width = 0, height = 0, dpr = 1, lastScene = -1, frame = 0;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const smooth = v => { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); };
    const resizeFilm = () => {
      const rect = film.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = Math.max(1, rect.width); height = Math.max(1, window.innerHeight);
      filmCanvas.width = Math.round(width * dpr); filmCanvas.height = Math.round(height * dpr);
      filmCanvas.style.width = width + 'px'; filmCanvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFilm();
    };
    const drawFilm = () => {
      if (!ctx || !width || !height) return;
      const rect = film.getBoundingClientRect();
      const total = Math.max(1, film.offsetHeight - height);
      const p = reduceMotion ? 0 : clamp(-rect.top / total, 0, 1);
      const scaled = p * 3;
      const scene = Math.min(3, Math.floor(scaled));
      const local = smooth(scaled - scene);
      if (scene !== lastScene) {
        const item = scenes[scene];
        kicker.textContent = item.kicker; title.innerHTML = item.title;
        description.textContent = item.description; count.textContent = String(scene + 1).padStart(2, '0');
        lastScene = scene;
      }
      filmProgress.style.width = (p * 100) + '%';
      ctx.fillStyle = '#10130d'; ctx.fillRect(0, 0, width, height);
      const cx = width * (width < 700 ? .73 : .69), cy = height * .53;
      const scale = Math.min(width, height);
      const radius = scale * (.12 + local * .17);
      const alpha = .18 + .18 * Math.sin(p * Math.PI);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2.8);
      glow.addColorStop(0, 'rgba(190,231,105,' + (alpha * .36) + ')');
      glow.addColorStop(1, 'rgba(190,231,105,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
      ctx.save(); ctx.translate(cx, cy);
      const rotation = p * Math.PI * .42;
      ctx.rotate(rotation);
      const sides = scene === 0 ? 12 : scene === 1 ? 8 : scene === 2 ? 4 : 6;
      for (let layer = 0; layer < 5; layer++) {
        const r = radius * (1 + layer * .22);
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
          const a = Math.PI * 2 * i / sides;
          const wobble = scene === 0 ? 1 + .035 * Math.sin(a * 3 + p * 8) : 1;
          const x = Math.cos(a) * r * wobble;
          const y = Math.sin(a) * r * wobble * (scene === 3 ? .66 : 1);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = layer === 0 ? 'rgba(200,241,105,.72)' : 'rgba(200,241,105,' + (.2 - layer * .025) + ')';
        ctx.lineWidth = layer === 0 ? 1.4 : .7;
        ctx.stroke();
      }
      ctx.restore();
      const grid = 48;
      ctx.strokeStyle = 'rgba(220,235,204,.055)'; ctx.lineWidth = .6;
      ctx.beginPath();
      for (let x = (width % grid); x < width; x += grid) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for (let y = (height % grid); y < height; y += grid) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();
      const points = 42;
      for (let i = 0; i < points; i++) {
        const t = i / points * Math.PI * 2 + p * 2.1;
        const orbit = radius * (1.25 + .12 * Math.sin(i * 2.4 + p * 5));
        const x = cx + Math.cos(t) * orbit;
        const y = cy + Math.sin(t) * orbit * .68;
        ctx.fillStyle = i % 5 === 0 ? 'rgba(200,241,105,.9)' : 'rgba(210,220,196,.3)';
        ctx.fillRect(x, y, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
      }
      ctx.fillStyle = 'rgba(200,241,105,.65)'; ctx.font = '8px Manrope, Arial';
      ctx.fillText('SKOL / ' + String(scene + 1).padStart(2, '0'), cx - radius * 1.2, cy + radius * 1.55);
      frame = requestAnimationFrame(() => {});
    };
    let filmTick = false;
    const requestFilmDraw = () => { if (!filmTick) { filmTick = true; requestAnimationFrame(() => { drawFilm(); filmTick = false; }); } };
    window.addEventListener('scroll', requestFilmDraw, { passive: true });
    window.addEventListener('resize', resizeFilm, { passive: true });
    resizeFilm();
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
})();