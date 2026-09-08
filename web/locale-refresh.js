(() => {
  window.addEventListener('colorpalette:localechange', () => {
    if (typeof window.route === 'function') window.route();
  });
})();
