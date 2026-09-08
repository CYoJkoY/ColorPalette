(() => {
  function refresh() {
    if (typeof window.route === 'function') window.route();
    if (typeof window.ColorPalettePreferences?.translate === 'function') {
      window.ColorPalettePreferences.translate(document.body);
    }
  }

  window.addEventListener('colorpalette:localechange', refresh);
  window.addEventListener('hashchange', () => {
    queueMicrotask(() => {
      if (typeof window.ColorPalettePreferences?.translate === 'function') {
        window.ColorPalettePreferences.translate(document.body);
      }
    });
  });
})();
