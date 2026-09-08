(() => {
  'use strict';

  const STORE = 'colorpalette-preferences-v4';
  const saved = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORE) || '{}');
    } catch (_) {
      return {};
    }
  })();

  const browserLanguage = String(navigator.language || '').toLowerCase();
  let language = saved.language === 'en' || saved.language === 'zh'
    ? saved.language
    : (browserLanguage.startsWith('zh') ? 'zh' : 'en');
  let theme = saved.theme === 'dark' || saved.theme === 'light' ? saved.theme : 'light';
  let suppressNextClick = false;

  function save() {
    localStorage.setItem(STORE, JSON.stringify({ language, theme }));
  }

  function state(button, value) {
    if (!button) return;
    button.dataset.state = value;
    button.setAttribute('aria-checked', String(value === 'en' || value === 'dark'));
  }

  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const button = document.querySelector('#theme-switch');
    if (button) {
      const label = language === 'zh'
        ? (theme === 'dark' ? '切换到日间模式' : '切换到夜间模式')
        : (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      button.setAttribute('aria-label', label);
      button.title = label;
      state(button, theme);
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#111214' : '#F7F7F4';
  }

  function installSwipe(button, callback) {
    let startX = null;
    let startY = null;
    button.addEventListener('pointerdown', event => {
      startX = event.clientX;
      startY = event.clientY;
      button.setPointerCapture?.(event.pointerId);
    });
    button.addEventListener('pointerup', event => {
      if (startX == null) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      startX = startY = null;
      if (Math.abs(dx) >= 18 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        suppressNextClick = true;
        callback(dx > 0 ? 'right' : 'left');
        window.setTimeout(() => { suppressNextClick = false; }, 350);
      }
    });
    button.addEventListener('pointercancel', () => { startX = startY = null; });
  }

  function setLanguage(next) {
    language = next === 'en' ? 'en' : 'zh';
    save();
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
    const button = document.querySelector('#language-switch');
    if (button) {
      const label = language === 'zh' ? '切换中文 / English' : 'Switch Chinese / English';
      button.setAttribute('aria-label', label);
      button.title = label;
      state(button, language);
    }
    applyTheme();
    window.dispatchEvent(new CustomEvent('colorpalette:localechange', {
      detail: { language, locale: language === 'en' ? 'en-US' : 'zh-CN' }
    }));
  }

  function setTheme(next) {
    theme = next === 'dark' ? 'dark' : 'light';
    save();
    applyTheme();
    window.dispatchEvent(new CustomEvent('colorpalette:themechange', { detail: { theme } }));
  }

  function boot() {
    const languageButton = document.querySelector('#language-switch');
    const themeButton = document.querySelector('#theme-switch');
    if (!languageButton || !themeButton) return;

    languageButton.addEventListener('click', () => {
      if (suppressNextClick) { suppressNextClick = false; return; }
      setLanguage(language === 'zh' ? 'en' : 'zh');
    });
    themeButton.addEventListener('click', () => {
      if (suppressNextClick) { suppressNextClick = false; return; }
      setTheme(theme === 'light' ? 'dark' : 'light');
    });

    installSwipe(languageButton, direction => setLanguage(direction === 'right' ? 'en' : 'zh'));
    installSwipe(themeButton, direction => setTheme(direction === 'right' ? 'dark' : 'light'));

    state(languageButton, language);
    state(themeButton, theme);
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
    applyTheme();
  }

  window.ColorPalettePreferences = {
    get language() { return language; },
    get locale() { return language === 'en' ? 'en-US' : 'zh-CN'; },
    get theme() { return theme; },
    t(text) {
      if (window.ColorPaletteI18nRuntime?.translateText) return window.ColorPaletteI18nRuntime.translateText(text);
      return String(text ?? '');
    },
    setLanguage,
    setTheme,
    translate() {
      window.ColorPaletteI18nRuntime?.translate(document.body);
    },
    applyTheme
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
