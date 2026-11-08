(() => {
  const tabs = [...document.querySelectorAll('[data-showcase-tab]')];
  const panels = [...document.querySelectorAll('[data-showcase-panel]')];
  if (!tabs.length || !panels.length) return;
  const activate = (name, focus = false) => {
    tabs.forEach(tab => {
      const active = tab.dataset.showcaseTab === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach(panel => {
      const active = panel.dataset.showcasePanel === name;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.showcaseTab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
        (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      activate(tabs[next].dataset.showcaseTab, true);
    });
  });
  activate(tabs[0].dataset.showcaseTab);
})();
