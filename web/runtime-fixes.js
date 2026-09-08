(() => {
  'use strict';

  function safeCopy(text) {
    const value = String(text ?? '');
    const fallback = () => {
      const area = document.createElement('textarea');
      area.value = value;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
        if (typeof window.toast === 'function') window.toast(window.ColorPalettePreferences?.t('已复制') || '已复制');
      } finally {
        area.remove();
      }
    };

    if (!navigator.clipboard?.writeText) {
      fallback();
      return;
    }

    navigator.clipboard.writeText(value).then(() => {
      if (typeof window.toast === 'function') window.toast(window.ColorPalettePreferences?.t('已复制') || '已复制');
    }).catch(fallback);
  }

  function createRouteHash(hash) {
    const raw = String(hash || '#/create');
    if (/^#\/create\//.test(raw)) return raw;
    if (/^#\/create\?/.test(raw)) return raw.replace(/^#\/create\?/, '#/create/?');
    return raw;
  }

  function normalizeCreateRoute() {
    const raw = String(location.hash || '');
    const normalized = createRouteHash(raw);
    if (normalized === raw) return false;
    history.replaceState(null, '', `${location.pathname}${location.search}${normalized}`);
    return true;
  }

  function wrapRoute() {
    if (typeof window.route !== 'function' || window.route.__colorPaletteRoutePatched) return;
    const original = window.route;
    const wrapped = function () {
      normalizeCreateRoute();
      return original();
    };
    wrapped.__colorPaletteRoutePatched = true;
    window.route = wrapped;
  }

  function installRouteClickGuard() {
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href^="#/create?"]');
      if (!link) return;
      const href = link.getAttribute('href');
      const normalized = createRouteHash(href);
      if (href !== normalized) link.setAttribute('href', normalized);
    }, true);
  }

  function translateWithLoadedLocale(root = document.body) {
    const language = window.ColorPalettePreferences?.language === 'en' ? 'en' : 'zh';
    const locales = window.ColorPaletteLocales || {};
    const locale = locales[language === 'en' ? 'en-US' : 'zh-CN'];
    if (!locale?.ui || !root) return;

    const ui = locale.ui || {};
    const relationMap = locale.relations || {};
    const modeMap = locale.modes || {};
    const descriptions = locale.relationDescriptions || {};
    const translateOne = value => {
      const source = String(value ?? '');
      const trimmed = source.trim();
      if (!trimmed) return source;
      if (Object.prototype.hasOwnProperty.call(ui, trimmed)) return source.replace(trimmed, ui[trimmed]);
      if (Object.prototype.hasOwnProperty.call(relationMap, trimmed)) return source.replace(trimmed, relationMap[trimmed]);
      if (Object.prototype.hasOwnProperty.call(modeMap, trimmed)) return source.replace(trimmed, modeMap[trimmed]);
      if (Object.prototype.hasOwnProperty.call(descriptions, trimmed)) return source.replace(trimmed, descriptions[trimmed]);
      return source;
    };

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement?.closest('script,style,noscript,template')) continue;
      const source = node.__cpOriginalText ?? node.__cpLocaleOriginal ?? node.nodeValue;
      if (node.__cpLocaleOriginal == null) node.__cpLocaleOriginal = source;
      node.nodeValue = translateOne(source);
    }

    root.querySelectorAll?.('input[placeholder], textarea[placeholder], [title], [aria-label]').forEach(element => {
      ['placeholder', 'title', 'aria-label'].forEach(attr => {
        if (!element.hasAttribute(attr)) return;
        const key = `__cpLocaleOriginal_${attr}`;
        const original = element.dataset[key] ?? element.getAttribute(attr) ?? '';
        element.dataset[key] = original;
        element.setAttribute(attr, translateOne(original));
      });
    });
  }

  function refreshTranslations() {
    requestAnimationFrame(() => {
      window.ColorPaletteI18nRuntime?.translate?.(document.body);
      requestAnimationFrame(() => translateWithLoadedLocale(document.body));
    });
  }

  function install() {
    window.copy = safeCopy;
    wrapRoute();
    normalizeCreateRoute();
    installRouteClickGuard();

    if (typeof window.savePalette === 'function' && !window.savePalette.__uniqueIds) {
      const original = window.savePalette;
      const wrapped = function (p) {
        const input = { ...(p || {}) };
        if (!input.id) {
          input.id = `palette-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        }
        return original(input);
      };
      wrapped.__uniqueIds = true;
      window.savePalette = wrapped;
    }

    const observer = new MutationObserver(mutations => {
      if (mutations.some(m => m.type === 'childList' && (m.addedNodes.length || m.removedNodes.length))) {
        refreshTranslations();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('colorpalette:localechange', refreshTranslations);
    window.addEventListener('hashchange', () => {
      normalizeCreateRoute();
      refreshTranslations();
    });
    refreshTranslations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
