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
      } finally { area.remove(); }
    };
    if (!navigator.clipboard?.writeText) return fallback();
    navigator.clipboard.writeText(value).then(() => {
      if (typeof window.toast === 'function') window.toast(window.ColorPalettePreferences?.t('已复制') || '已复制');
    }).catch(fallback);
  }

  function patchRoute() {
    if (typeof window.route !== 'function' || window.route.__colorPaletteRoutePatched) return;
    const original = window.route;
    const patched = function () {
      const raw = String(location.hash || '#/home').replace(/^#/, '') || '/home';
      const queryIndex = raw.indexOf('?');
      const pathname = queryIndex >= 0 ? raw.slice(0, queryIndex) : raw;
      const parts = pathname.split('/').filter(Boolean);
      const routeName = parts[0] || 'home';
      const id = parts.slice(1).join('/');

      if (typeof window.navActive === 'function') window.navActive(routeName);
      if (routeName === 'home') return window.renderHome?.();
      if (routeName === 'library') return window.renderLibrary?.();
      if (routeName === 'extractor') return window.renderExtractor?.();
      if (routeName === 'create') return window.renderCreate?.();
      if (routeName === 'favorites') return window.renderFavorites?.();
      if (routeName === 'workspace') return window.renderWorkspace?.();
      if (routeName === 'pro') return window.renderPro?.();
      if (routeName === 'color') return window.renderDetail?.(decodeURIComponent(id));
      return original();
    };
    Object.defineProperty(patched, '__colorPaletteRoutePatched', { value: true });
    window.route = patched;
  }

  function repairCreateLinks(root = document) {
    root.querySelectorAll?.('a[href^="#/create?"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#/create?')) {
        link.setAttribute('href', href.replace(/^#\/create\?/, '#/create/?'));
      }
    });
  }

  // One translation authority only: i18n-runtime owns text conversion.
  // runtime-fixes is limited to route/link repair and asks i18n-runtime to re-translate
  // after DOM changes. This prevents two translators from racing over the same nodes.
  function refreshUI() {
    patchRoute();
    repairCreateLinks(document);
    requestAnimationFrame(() => {
      window.ColorPaletteI18nRuntime?.translate?.(document.body);
      repairCreateLinks(document);
    });
  }

  function install() {
    window.copy = safeCopy;
    patchRoute();

    if (typeof window.savePalette === 'function' && !window.savePalette.__uniqueIds) {
      const original = window.savePalette;
      const wrapped = function (p) {
        const input = { ...(p || {}) };
        if (!input.id) input.id = `palette-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        return original(input);
      };
      wrapped.__uniqueIds = true;
      window.savePalette = wrapped;
    }

    let queued = false;
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; refreshUI(); });
    };
    const observer = new MutationObserver(mutations => {
      if (mutations.some(m => m.type === 'childList' && (m.addedNodes.length || m.removedNodes.length))) schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('colorpalette:localechange', schedule);
    window.addEventListener('hashchange', schedule);
    refreshUI();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
