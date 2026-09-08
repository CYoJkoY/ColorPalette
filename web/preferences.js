(() => {
  const STORE = 'colorpalette-preferences-v3';
  const saved = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORE)) || JSON.parse(localStorage.getItem('colorpalette-preferences-v2')) || {};
    } catch (_) {
      return {};
    }
  })();

  const browserLanguage = String(navigator.language || '').toLowerCase();
  let language = saved.language === 'en' || saved.language === 'zh'
    ? saved.language
    : (browserLanguage.startsWith('zh') ? 'zh' : 'en');
  let theme = saved.theme === 'dark' || saved.theme === 'light'
    ? saved.theme
    : 'light';

  const localeCode = () => language === 'en' ? 'en-US' : 'zh-CN';
  const locale = () => window.ColorPaletteLocales?.[localeCode()] || window.ColorPaletteLocales?.['zh-CN'] || { ui: {} };
  const save = () => localStorage.setItem(STORE, JSON.stringify({ language, theme }));

  function translateText(text) {
    if (language === 'zh') return String(text);
    let out = String(text);
    const dictionary = window.ColorPaletteLocales?.['en-US']?.ui || {};
    Object.entries(dictionary)
      .sort((a, b) => b[0].length - a[0].length)
      .forEach(([zh, en]) => { out = out.split(zh).join(en); });
    return out
      .replace(/^(\d+) 个命名颜色$/, '$1 named colors')
      .replace(/^(\d+) 个颜色$/, '$1 colors')
      .replace(/^(\d+) 个命名颜色 · /, '$1 named colors · ')
      .replace(/^(\d+) 个颜色 · /, '$1 colors · ');
  }

  function updateMeta() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#111214' : '#F7F7F4';
    document.title = language === 'zh' ? 'ColorPalette — 颜色工作台' : 'ColorPalette — Color Workspace';
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = language === 'zh'
        ? 'ColorPalette：图片取色、颜色百科、配色生成、色卡收藏与工作区。'
        : 'ColorPalette: image color extraction, color library, palette generation, favorites and workspace.';
    }
  }

  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const button = document.querySelector('#theme-switch');
    if (button) {
      const label = language === 'zh'
        ? (theme === 'dark' ? '切换到日间模式' : '切换到夜间模式')
        : (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      button.setAttribute('aria-checked', String(theme === 'dark'));
      button.setAttribute('aria-label', label);
      button.title = label;
      button.dataset.state = theme;
    }
    updateMeta();
  }

  function translate(root = document.body) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      if (!node.nodeValue.trim() || node.parentElement?.closest('script,style')) return;
      if (!node.__cpOriginal) node.__cpOriginal = node.nodeValue;
      node.nodeValue = language === 'en' ? translateText(node.__cpOriginal) : node.__cpOriginal;
    });

    root.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el => {
      if (!el.dataset.cpPlaceholder) el.dataset.cpPlaceholder = el.placeholder;
      el.placeholder = language === 'en' ? translateText(el.dataset.cpPlaceholder) : el.dataset.cpPlaceholder;
    });

    root.querySelectorAll('[title]').forEach(el => {
      if (!el.dataset.cpTitle) el.dataset.cpTitle = el.title;
      el.title = language === 'en' ? translateText(el.dataset.cpTitle) : el.dataset.cpTitle;
    });

    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';

    const languageButton = document.querySelector('#language-switch');
    if (languageButton) {
      const label = language === 'zh' ? '切换中文 / English' : 'Switch Chinese / English';
      languageButton.setAttribute('aria-checked', String(language === 'en'));
      languageButton.setAttribute('aria-label', label);
      languageButton.title = label;
      languageButton.dataset.state = language;
    }
    updateMeta();
  }

  function notifyLocaleChange() {
    window.dispatchEvent(new CustomEvent('colorpalette:localechange', {
      detail: { language, locale: localeCode() }
    }));
  }

  function setLanguage(next) {
    language = next === 'en' ? 'en' : 'zh';
    save();
    translate();
    applyTheme();
    notifyLocaleChange();
  }

  function setTheme(next) {
    theme = next === 'dark' ? 'dark' : 'light';
    save();
    applyTheme();
  }

  function installSwipe(button, toggle) {
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
      if (Math.abs(dx) >= 24 && Math.abs(dx) > Math.abs(dy) * 1.25) {
        toggle(dx > 0 ? 'right' : 'left');
      }
    });

    button.addEventListener('pointercancel', () => { startX = startY = null; });
  }

  function boot() {
    const languageButton = document.querySelector('#language-switch');
    const themeButton = document.querySelector('#theme-switch');
    if (!languageButton || !themeButton) return;

    languageButton.addEventListener('click', () => setLanguage(language === 'zh' ? 'en' : 'zh'));
    themeButton.addEventListener('click', () => setTheme(theme === 'light' ? 'dark' : 'light'));

    installSwipe(languageButton, direction => {
      const next = direction === 'right' ? 'en' : 'zh';
      if (next !== language) setLanguage(next);
    });
    installSwipe(themeButton, direction => {
      const next = direction === 'right' ? 'dark' : 'light';
      if (next !== theme) setTheme(next);
    });

    applyTheme();
    translate();

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE && language === 'en') translate(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.ColorPalettePreferences = {
      get language() { return language; },
      get locale() { return localeCode(); },
      get theme() { return theme; },
      t: translateText,
      tKey: (key, fallback) => window.ColorPaletteI18n?.t(key, fallback) ?? fallback,
      lookup: text => locale().ui?.[text] ?? text,
      setLanguage,
      setTheme,
      translate,
      applyTheme
    };
    notifyLocaleChange();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
