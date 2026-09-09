(() => {
  'use strict';

  const STORE = { active: null };
  const uiText = (key, fallback) => String(window.ColorPaletteI18n?.data?.ui?.[key] ?? fallback ?? key);
  const isCreateRoute = () => location.hash.replace(/^#/, '').split('?')[0] === '/create';
  const stop = () => {
    if (!STORE.active) return;
    clearTimeout(STORE.active.timeout);
    clearInterval(STORE.active.interval);
    STORE.active = null;
  };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
  const change = button => {
    const target = button?.dataset.stepTarget;
    const amount = Number(button?.dataset.step || 0);
    const input = target ? document.querySelector(`#${CSS.escape(target)}`) : null;
    if (!input || !amount) return false;
    const next = clamp((Number(input.value) || 0) + amount, Number(input.min), Number(input.max));
    input.value = String(next);
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  };
  const start = (event, button) => {
    event.preventDefault();
    stop();
    if (!isCreateRoute()) return;
    change(button);
    const state = { button, timeout: 0, interval: 0, delay: 120 };
    state.timeout = setTimeout(() => {
      const repeat = () => {
        if (!isCreateRoute() || !document.contains(state.button)) return stop();
        if (!change(state.button)) return stop();
        state.delay = Math.max(30, state.delay - 8);
        clearInterval(state.interval);
        state.interval = setInterval(repeat, state.delay);
      };
      state.interval = setInterval(repeat, state.delay);
    }, 320);
    STORE.active = state;
  };
  const bind = () => {
    document.querySelectorAll('.cp-number-step[data-step-target]').forEach(button => {
      if (button.dataset.longpressReady === '1') return;
      button.dataset.longpressReady = '1';
      button.setAttribute('aria-label', button.dataset.step === '1'
        ? uiText('create.increment', 'Increase value')
        : uiText('create.decrement', 'Decrease value'));
      const begin = event => start(event, button);
      button.addEventListener('mousedown', begin);
      button.addEventListener('touchstart', begin, { passive: false });
      button.addEventListener('mouseup', stop);
      button.addEventListener('mouseleave', stop);
      button.addEventListener('touchend', stop);
      button.addEventListener('touchcancel', stop);
      button.addEventListener('contextmenu', event => event.preventDefault());
    });
  };
  const observer = new MutationObserver(bind);
  observer.observe(document.querySelector('#app') || document.body, { childList: true, subtree: true });
  document.addEventListener('mouseup', stop, true);
  document.addEventListener('touchend', stop, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('hashchange', () => { stop(); bind(); });
  window.addEventListener('colorpalette:localechange', () => { stop(); bind(); });
  bind();
})();
