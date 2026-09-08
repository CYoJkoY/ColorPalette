(() => {
  'use strict';

  const PREF_KEY = 'colorpalette-preferences-v4';
  const ZH = 'zh';
  const EN = 'en';

  function getLanguage() {
    const preference = window.ColorPalettePreferences?.language;
    if (preference === EN || preference === ZH) return preference;
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
      if (saved.language === EN || saved.language === ZH) return saved.language;
    } catch (_) {}
    return /^en(?:-|$)/i.test(navigator.language || '') ? EN : ZH;
  }

  function dictionaries() {
    const locale = window.ColorPaletteLocales?.['en-US']?.ui || {};
    const complete = window.ColorPaletteCompleteLocale?.en || {};
    return { ...complete, ...locale };
  }

  function forwardPairs() {
    return Object.entries(dictionaries())
      .filter(([from, to]) => from && to && from !== to)
      .sort((a, b) => b[0].length - a[0].length);
  }

  function reversePairs() {
    const map = {};
    for (const [zh, en] of forwardPairs()) if (!map[en]) map[en] = zh;
    Object.assign(map, window.ColorPaletteCompleteLocale?.reverseZh || {});
    return Object.entries(map)
      .filter(([from, to]) => from && to && from !== to)
      .sort((a, b) => b[0].length - a[0].length);
  }

  function translateValue(value, language) {
    let output = String(value ?? '');
    const pairs = language === EN ? forwardPairs() : reversePairs();
    for (const [from, to] of pairs) {
      if (output === from) return to;
      if (output.includes(from)) output = output.split(from).join(to);
    }
    return output
      .replace(/^(\d+) 个命名颜色$/, '$1 named colors')
      .replace(/^(\d+) 个颜色$/, '$1 colors')
      .replace(/^(\d+) 个命名颜色 · /, '$1 named colors · ')
      .replace(/^(\d+) 个颜色 · /, '$1 colors · ')
      .replace(/^(\d+) samples$/, '$1 samples');
  }

  function translateNode(node, language) {
    const original = node.__cpOriginal ?? node.nodeValue;
    if (!original || !String(original).trim()) return;
    node.__cpOriginal = original;
    const translated = translateValue(original, language);
    if (translated !== node.nodeValue) node.nodeValue = translated;
  }

  function translateAttributes(root, language) {
    root.querySelectorAll?.('input[placeholder], textarea[placeholder], [title], [aria-label]').forEach(element => {
      for (const attribute of ['placeholder', 'title', 'aria-label']) {
        if (!element.hasAttribute(attribute)) continue;
        const key = `data-cp-${attribute}-original`;
        const original = element.getAttribute(key) ?? element.getAttribute(attribute) ?? '';
        element.setAttribute(key, original);
        element.setAttribute(attribute, translateValue(original, language));
      }
    });
  }

  function translate(root = document.body) {
    if (!root) return;
    const language = getLanguage();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.nodeValue.trim() || node.parentElement?.closest('script,style,noscript,template')) continue;
      nodes.push(node);
    }
    nodes.forEach(node => translateNode(node, language));
    translateAttributes(root, language);

    document.documentElement.lang = language === EN ? 'en' : 'zh-CN';
    document.title = language === EN ? 'ColorPalette — Color Workspace' : 'ColorPalette — 颜色工作台';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = language === EN
      ? 'ColorPalette: image color extraction, color library, palette generation, favorites and a local-first workspace.'
      : 'ColorPalette：图片取色、颜色百科、配色生成、色卡收藏与工作区。';
  }

  function animateRoute() {
    const app = document.querySelector('#app');
    if (!app) return;
    app.classList.remove('cp-route-enter');
    void app.offsetWidth;
    app.classList.add('cp-route-enter');
  }

  function refresh() {
    translate(document.body);
    animateRoute();
  }

  const start = () => {
    refresh();
    const observer = new MutationObserver(mutations => {
      let relevant = false;
      for (const mutation of mutations) {
        if (mutation.type !== 'childList' || !mutation.addedNodes.length) continue;
        relevant = true;
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) translate(node);
          else if (node.nodeType === Node.TEXT_NODE) translateNode(node, getLanguage());
        });
      }
      if (relevant) document.querySelector('#app')?.classList.add('cp-motion-ready');
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('hashchange', () => requestAnimationFrame(refresh));
    window.addEventListener('colorpalette:localechange', () => requestAnimationFrame(refresh));
    window.ColorPaletteUIPolish = { translate, refresh, animateRoute };
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
