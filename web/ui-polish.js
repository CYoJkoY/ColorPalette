(() => {
  'use strict';

  const ROOT = document.documentElement;
  const APP_ID = 'app';
  const PREF_KEY = 'colorpalette-preferences-v4';
  const FALLBACK_ZH = 'zh-CN';
  const FALLBACK_EN = 'en-US';

  function getLanguage() {
    const pref = window.ColorPalettePreferences?.language;
    if (pref === 'en' || pref === 'en-US') return 'en-US';
    try {
      const raw = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
      if (raw.language === 'en' || raw.language === 'en-US') return FALLBACK_EN;
      if (raw.language === 'zh' || raw.language === 'zh-CN') return FALLBACK_ZH;
    } catch (_) {}
    return /^en(?:-|$)/i.test(navigator.language || '') ? FALLBACK_EN : FALLBACK_ZH;
  }

  function locales() {
    return window.ColorPaletteLocales || {};
  }

  function activeLocale() {
    return locales()[getLanguage()] || locales[FALLBACK_ZH] || {};
  }

  function buildDictionary(language) {
    const source = locales()[language] || {};
    const ui = source.ui || {};
    const dictionary = { ...ui };
    const complete = window.ColorPaletteCompleteLocale;

    if (language === FALLBACK_EN && complete?.en) {
      Object.assign(dictionary, complete.en, ui);
    }

    return Object.entries(dictionary)
      .filter(([from, to]) => from && to && from !== to)
      .sort((a, b) => b[0].length - a[0].length);
  }

  function buildReverseDictionary() {
    const forward = {
      ...buildDictionary(FALLBACK_EN).reduce((map, [zh, en]) => {
        if (!map[en]) map[en] = zh;
        return map;
      }, {}),
      ...(window.ColorPaletteCompleteLocale?.reverseZh || {})
    };
    return Object.entries(forward)
      .filter(([from, to]) => from && to && from !== to)
      .sort((a, b) => b[0].length - a[0].length);
  }

  function replaceKnown(text, language) {
    let output = String(text ?? '');
    const pairs = language === FALLBACK_EN ? buildDictionary(FALLBACK_EN) : buildReverseDictionary();
    for (const [from, to] of pairs) {
      if (output === from) return to;
      if (output.includes(from)) output = output.split(from).join(to);
    }
    return output;
  }

  function translateTextNode(node, language) {
    const current = node.nodeValue || '';
    if (!current.trim()) return;

    const original = node.__cpUiOriginal ?? current;
    node.__cpUiOriginal = original;
    const translated = replaceKnown(original, language);
    if (translated !== current) node.nodeValue = translated;
  }

  function translateElement(element, language) {
    if (!element || element.nodeType !== 1) return;

    for (const attr of ['placeholder', 'title', 'aria-label']) {
      if (element.hasAttribute(attr)) {
        const current = element.getAttribute(attr) || '';
        const originalKey = `__cpUiOriginal_${attr}`;
        const original = element.dataset[originalKey] ?? current;
        element.dataset[originalKey] = original;
        const translated = replaceKnown(original, language);
        if (translated !== current) element.setAttribute(attr, translated);
      }
    }

    if (element.tagName === 'HTML') {
      element.lang = language;
    }
  }

  function translate(root = document.body) {
    if (!root) return;
    const language = getLanguage();

    if (root.nodeType === 1) translateElement(root, language);

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement?.matches('script,style,noscript,template')) continue;
      nodes.push(node);
    }
    nodes.forEach(node => translateTextNode(node, language));

    root.querySelectorAll?.('*').forEach(element => translateElement(element, language));

    const locale = activeLocale();
    if (language === FALLBACK_EN) {
      document.title = 'ColorPalette — Color Workspace';
      document.querySelector('meta[name="description"]')?.setAttribute('content', 'ColorPalette: image color extraction, color library, palette generation, saved palettes, and a local-first workspace.');
    } else {
      document.title = 'ColorPalette — 颜色工作台';
      document.querySelector('meta[name="description"]')?.setAttribute('content', 'ColorPalette：图片取色、颜色百科、配色生成、色卡收藏与工作区。');
    }

    ROOT.lang = locale.code || language;
  }

  function animateRoute() {
    const app = document.getElementById(APP_ID);
    if (!app) return;
    app.classList.remove('cp-route-enter');
    void app.offsetWidth;
    app.classList.add('cp-route-enter');
  }

  function syncMotionState() {
    const app = document.getElementById(APP_ID);
    if (!app) return;
    app.dataset.motionReady = 'true';
  }

  function patchPreferences() {
    const preferences = window.ColorPalettePreferences;
    if (!preferences || preferences.__cpUiPolishPatched) return;
    const originalSetLanguage = preferences.setLanguage;
    const originalSetTheme = preferences.setTheme;

    if (typeof originalSetLanguage === 'function') {
      preferences.setLanguage = function patchedSetLanguage(...args) {
        const result = originalSetLanguage.apply(this, args);
        requestAnimationFrame(() => {
          translate(document.body);
          animateRoute();
        });
        return result;
      };
    }

    if (typeof originalSetTheme === 'function') {
      preferences.setTheme = function patchedSetTheme(...args) {
        const result = originalSetTheme.apply(this, args);
        requestAnimationFrame(() => translate(document.body));
        return result;
      };
    }

    preferences.__cpUiPolishPatched = true;
  }

  function install() {
    patchPreferences();

    const observer = new MutationObserver(mutations => {
      let changed = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && (mutation.addedNodes.length || mutation.removedNodes.length)) {
          changed = true;
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) translate(node);
            else if (node.nodeType === 3) translateTextNode(node, getLanguage());
          });
        }
      }
      if (changed) {
        patchPreferences();
        syncMotionState();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('colorpalette:localechange', () => {
      requestAnimationFrame(() => {
        translate(document.body);
        animateRoute();
      });
    });

    window.addEventListener('hashchange', () => {
      requestAnimationFrame(() => {
        translate(document.body);
        animateRoute();
      });
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        translate(document.body);
        syncMotionState();
      }, { once: true });
    } else {
      translate(document.body);
      syncMotionState();
    }

    setTimeout(() => {
      patchPreferences();
      translate(document.body);
    }, 0);
  }

  window.ColorPaletteUIPolish = { translate, animateRoute };
  install();
})();
