(() => {
  'use strict';

  function reduceMotion() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  }

  function playRouteMotion() {
    const app = document.querySelector('#app');
    if (!app || reduceMotion()) return;
    app.classList.remove('cp-route-enter', 'cp-motion-ready');
    void app.offsetWidth;
    app.classList.add('cp-route-enter');
    requestAnimationFrame(() => app.classList.add('cp-motion-ready'));
  }

  function playStateMotion(selector) {
    const target = document.querySelector(selector);
    if (!target || reduceMotion()) return;
    target.animate(
      [{ opacity: .72, transform: 'translateY(2px) scale(.985)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }],
      { duration: 220, easing: 'cubic-bezier(.16,1,.3,1)' }
    );
  }

  function playThemeMotion() {
    if (reduceMotion()) return;
    // A theme change already invalidates styles across a large rendered grid.
    // Animating the entire body adds another compositing pass and makes pages
    // with hundreds of color cards noticeably stutter. Keep the theme change
    // itself synchronous and animate only the compact theme control.
    const button = document.querySelector('#theme-switch');
    if (!button) return;
    requestAnimationFrame(() => {
      button.animate(
        [{ transform: 'scale(.96)' }, { transform: 'scale(1)' }],
        { duration: 150, easing: 'cubic-bezier(.16,1,.3,1)' }
      );
    });
  }

  window.ColorPaletteUIMotion = { playRouteMotion, playStateMotion, playThemeMotion };

  window.addEventListener('hashchange', () => requestAnimationFrame(playRouteMotion));
  window.addEventListener('colorpalette:localechange', () => requestAnimationFrame(playRouteMotion));
  window.addEventListener('colorpalette:themechange', playThemeMotion);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', playRouteMotion, { once: true });
  } else {
    playRouteMotion();
  }
})();
